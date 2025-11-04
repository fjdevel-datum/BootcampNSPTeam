package org.acme.ocrquarkus;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.ocrquarkus.service.GastoService;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Base64;

@ApplicationScoped
public class OcrService {

    @ConfigProperty(name = "azure.docintel.endpoint")
    String endpoint;

    @ConfigProperty(name = "azure.docintel.key")
    String apiKey;

    @Inject
    GastoService gastoService;

    @Inject
    LlmService llmService;

    private static final int MAX_POLL_ATTEMPTS = 90;
    private static final long INITIAL_POLL_DELAY_MILLIS = 1000;
    private static final long MAX_POLL_DELAY_MILLIS = 4000;

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    private static final ObjectMapper M = new ObjectMapper();

    public String ocr(byte[] imageBytes) throws Exception {
        if (imageBytes == null || imageBytes.length == 0) {
            throw new BadRequestException("The uploaded file is empty or unreadable.");
        }

        ensureAzureConfiguration();

        // 1. Procesar la imagen con Azure Document Intelligence
        System.out.println("Enviando imagen a Azure Document Intelligence...");
        String ocrResult = processWithAzure(imageBytes);
        System.out.println("Respuesta de Azure: " + ocrResult);
        
        // 2. Extraer el texto del resultado del OCR
        String extractedText = extractText(ocrResult);
        System.out.println("Texto extraído del OCR: " + extractedText);
        
        // 3. Procesar con Hugging Face LLM
        String llmResult = processWithLLM(extractedText);
        
        // Validar que la respuesta del LLM sea un JSON válido
        // Nota: El guardado en BD se realiza desde el frontend llamando a /api/gastos/llm.
        //       Para evitar duplicados, aquí solo validamos el JSON sin persistir.
        try {
            M.readTree(llmResult);
        } catch (Exception e) {
            System.err.println("La respuesta del LLM no es un JSON válido: " + llmResult);
            llmResult = "{\"error\": \"La respuesta del LLM no es un JSON válido\"}";
        }
        
        // 5. Crear respuesta con toda la información
        var response = new TotalResult();
        response.ocrResult = ocrResult;
        response.extractedText = extractedText;
        response.llmResponse = llmResult;
        
        // 6. Devolver la respuesta completa como JSON
        return M.writeValueAsString(response);
    }

    private String processWithAzure(byte[] imageBytes) throws Exception {
        String apiVersion = "2024-02-29-preview";
        String analyzeUrl = endpoint +
                "documentintelligence/documentModels/prebuilt-read:analyze?api-version=" + apiVersion;

        String base64 = Base64.getEncoder().encodeToString(imageBytes);
        String body = "{\"base64Source\":\"" + base64 + "\"}";

        HttpRequest submit = HttpRequest.newBuilder()
                .uri(URI.create(analyzeUrl))
                .timeout(Duration.ofSeconds(60))
                .header("Ocp-Apim-Subscription-Key", apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> submitRes = client.send(submit, HttpResponse.BodyHandlers.ofString());
        int initialStatus = submitRes.statusCode();
        System.out.println("Status code inicial: " + initialStatus);
        System.out.println("Respuesta inicial: " + submitRes.body());

        if (initialStatus < 200 || initialStatus >= 300) {
            throw remoteError("Azure Document Intelligence rejected the analyze request", initialStatus, submitRes.body());
        }

        String opLoc = submitRes.headers().firstValue("operation-location").orElse(null);
        if (opLoc == null || opLoc.isBlank()) {
            throw remoteError("Azure Document Intelligence did not return the operation-location header", initialStatus, submitRes.body());
        }
        System.out.println("URL de operacion: " + opLoc);

        // Polling hasta 'succeeded'
        long totalDelayMillis = 0;
        for (int attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
            long delay = Math.min(
                    INITIAL_POLL_DELAY_MILLIS + attempt * 250L,
                    MAX_POLL_DELAY_MILLIS
            );
            Thread.sleep(delay);
            totalDelayMillis += delay;
            HttpRequest get = HttpRequest.newBuilder()
                    .uri(URI.create(opLoc))
                    .timeout(Duration.ofSeconds(60))
                    .header("Ocp-Apim-Subscription-Key", apiKey)
                    .GET()
                    .build();
            HttpResponse<String> res = client.send(get, HttpResponse.BodyHandlers.ofString());
            int pollStatus = res.statusCode();
            if (pollStatus >= 400) {
                throw remoteError("Azure Document Intelligence returned an error while polling the analyze operation", pollStatus, res.body());
            }
            JsonNode j = M.readTree(res.body());
            String status = j.path("status").asText();
            if ("succeeded".equalsIgnoreCase(status)) {
                return res.body();
            }
            if ("failed".equalsIgnoreCase(status)) {
                throw remoteError("Azure Document Intelligence reported a failed status for the analyze operation", pollStatus, res.body());
            }
        }
        long waitedSeconds = (long) Math.ceil(totalDelayMillis / 1000.0);
        throw remoteError(
                "Azure Document Intelligence did not finish within the expected time (" + waitedSeconds + "s)",
                504,
                null
        );
    }

    private String extractText(String ocrResult) throws Exception {
        JsonNode json = M.readTree(ocrResult);
        StringBuilder text = new StringBuilder();
        
        JsonNode pages = json.path("analyzeResult").path("pages");
        for (JsonNode page : pages) {
            JsonNode lines = page.path("lines");
            for (JsonNode line : lines) {
                text.append(line.path("content").asText()).append("\n");
            }
        }
        
        return text.toString();
    }

    private String processWithLLM(String text) throws Exception {
        return llmService.classifyFromOcr(text, null, null);
    }

    private void ensureAzureConfiguration() {
        if (endpoint == null || endpoint.isBlank()) {
            throw configurationError("Azure Document Intelligence endpoint is not configured.");
        }
        if (apiKey == null || apiKey.isBlank()) {
            throw configurationError("Azure Document Intelligence key is not configured.");
        }
    }

    private WebApplicationException configurationError(String message) {
        return plainTextError(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), message);
    }

    private WebApplicationException remoteError(String context, int statusCode, String body) {
        StringBuilder message = new StringBuilder(context);
        if (statusCode > 0) {
            message.append(" (status ").append(statusCode).append(')');
        }
        if (body != null && !body.isBlank()) {
            message.append(": ").append(body);
        }

        int httpStatus;
        if (statusCode == 400 || statusCode == 413 || statusCode == 415 || statusCode == 422) {
            httpStatus = Response.Status.BAD_REQUEST.getStatusCode();
        } else if (statusCode >= 400 && statusCode < 500) {
            httpStatus = Response.Status.BAD_GATEWAY.getStatusCode();
        } else if (statusCode >= 500 && statusCode < 600) {
            httpStatus = Response.Status.BAD_GATEWAY.getStatusCode();
        } else {
            httpStatus = Response.Status.BAD_GATEWAY.getStatusCode();
        }

        return plainTextError(httpStatus, message.toString());
    }

    private WebApplicationException plainTextError(int statusCode, String message) {
        Response.ResponseBuilder builder = Response.status(statusCode)
                .type(MediaType.TEXT_PLAIN_TYPE);
        if (message != null && !message.isBlank()) {
            builder.entity(message);
        }
        return new WebApplicationException(builder.build());
    }
}
