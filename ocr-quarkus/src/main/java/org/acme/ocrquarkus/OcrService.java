package org.acme.ocrquarkus;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
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

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(20))
            .build();

    private static final ObjectMapper M = new ObjectMapper();

    public String ocr(byte[] imageBytes) throws Exception {
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
        System.out.println("Status code inicial: " + submitRes.statusCode());
        System.out.println("Respuesta inicial: " + submitRes.body());
        
        String opLoc = submitRes.headers().firstValue("operation-location")
                .orElseThrow(() -> new IllegalStateException("operation-location no devuelto por el servicio"));
        System.out.println("URL de operación: " + opLoc);

        // Polling hasta 'succeeded'
        for (int i = 0; i < 30; i++) {
            Thread.sleep(1000);
            HttpRequest get = HttpRequest.newBuilder()
                    .uri(URI.create(opLoc))
                    .timeout(Duration.ofSeconds(30))
                    .header("Ocp-Apim-Subscription-Key", apiKey)
                    .GET()
                    .build();
            HttpResponse<String> res = client.send(get, HttpResponse.BodyHandlers.ofString());
            JsonNode j = M.readTree(res.body());
            String status = j.path("status").asText();
            if ("succeeded".equalsIgnoreCase(status)) {
                return res.body();
            }
            if ("failed".equalsIgnoreCase(status)) {
                throw new IllegalStateException("Analyze failed: " + res.body());
            }
        }
        throw new IllegalStateException("Timeout esperando resultado de Document Intelligence.");
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
}

