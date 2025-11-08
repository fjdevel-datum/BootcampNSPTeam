package org.acme.ocrquarkus;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.enterprise.context.ApplicationScoped;   // <-- jakarta
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

@ApplicationScoped
public class LlmService {

    @ConfigProperty(name = "hf.router.url")
    String routerUrl;

    @ConfigProperty(name = "hf.model")
    String model;

    @ConfigProperty(name = "hf.token")
    String token;

    @ConfigProperty(name = "hf.max-new-tokens", defaultValue = "256")
    Integer defaultMaxNewTokens;

    @ConfigProperty(name = "hf.temperature", defaultValue = "0.7")
    Double defaultTemperature;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(20))
            .build();

   private final ObjectMapper mapper = new ObjectMapper()
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
        .setDefaultPropertyInclusion(
            JsonInclude.Value.construct(JsonInclude.Include.NON_NULL, JsonInclude.Include.ALWAYS)
        );

    /** Prompt plantilla pedido por el usuario */
    private String buildClassificationPrompt(String ocrText) {
        String plantilla =
            "A partir del siguiente resultado de OCR de una factura, extrae y formatea la información en un objeto JSON válido "
          + "con los siguientes campos: 'NombreEmpresa', 'Descripcion', 'MontoTotal' y 'Fecha'. \n\n"
          + "Reglas:\n"
          + "- La respuesta DEBE ser un JSON válido\n"
          + "- Los nombres de los campos deben ser exactamente los mostrados arriba\n"
          + "- Ejemplos de formatos aceptados:\n"
          + "  MontoTotal: debe ser número sin símbolo de moneda (ej: '25.00' o '1215.00' o '17.70') no omitas los ceros de la derecha, usa la palabra 'total' como referencia para identificar el total\n"
          + "  Fecha: puede ser en formato '21/09/25' cada vez que apararezca (03:33PM) o algo similar toma como el año actual, si el formato viene en ingles mes/dia/año (04/22/25) pasala a español dia/mes/año (22/04/25), revisa muy bien la fecha que sea la misma que recibes del ocr\n"
          + "  NombreEmpresa: solo el nombre principal, sin sucursales\n"
          + "  Descripcion: breve descripción de la transacción\n\n"
          + "Ejemplo de respuesta esperada:\n"
          + "{\n"
          + "  \"NombreEmpresa\": \"Texaco\",\n"
          + "  \"Descripcion\": \"Compra de combustible\",\n"
          + "  \"MontoTotal\": \"25.00\",\n"
          + "  \"Fecha\": \"21/09/25\"\n"
          + "}\n\n"
          + "OCR a procesar:\n" + (ocrText == null ? "" : ocrText);
        return plantilla;
    }

    public String classifyFromOcr(String ocrText, Integer maxTokens, Double temperature) throws Exception {
        ChatRequest req = new ChatRequest();
        req.model = model;
        req.messages = List.of(
                new Message("system", "Eres un asistente que extrae y resume información de facturas a partir de texto OCR. Responde SOLO en el formato solicitado, sin explicaciones adicionales."),
                new Message("user", buildClassificationPrompt(ocrText))
        );
        req.maxNewTokens = maxTokens != null ? maxTokens : defaultMaxNewTokens; // algunos usan max_new_tokens
        req.maxTokens    = req.maxNewTokens;                                     // otros usan max_tokens
        req.temperature  = temperature != null ? temperature : defaultTemperature;
        req.stream       = false;

        String body = mapper.writeValueAsString(req);

        HttpRequest httpReq = HttpRequest.newBuilder()
                .uri(URI.create(routerUrl))
                .timeout(Duration.ofSeconds(60))
                .header("Authorization", "Bearer " + token)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> resp = http.send(httpReq, HttpResponse.BodyHandlers.ofString());

        if (resp.statusCode() >= 200 && resp.statusCode() < 300) {
            ChatResponse cr = mapper.readValue(resp.body(), ChatResponse.class);
            String content = null;
            if (cr != null && cr.choices != null && !cr.choices.isEmpty()
                    && cr.choices.get(0) != null && cr.choices.get(0).message != null) {
                content = cr.choices.get(0).message.content;
            }
            return content != null ? content.trim() : "(sin contenido)";
        }
        if (resp.statusCode() == 404) return "(404) El modelo no está disponible en el router o el nombre es incorrecto: " + model;
        if (resp.statusCode() == 401) return "(401) Token inválido o sin permisos para el router.";
        return "Error HTTP " + resp.statusCode() + ": " + resp.body();
    }

    // ===== DTOs mínimos para el router chat/completions =====
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Message {
        public String role;
        public String content;
        public Message() {}
        public Message(String role, String content) { this.role = role; this.content = content; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ChatRequest {
        public List<Message> messages;
        public String model;
        @JsonProperty("max_tokens")     public Integer maxTokens;
        @JsonProperty("max_new_tokens") public Integer maxNewTokens;
        public Double temperature;
        public Boolean stream;
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ChatResponse {
        public List<Choice> choices;
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Choice {
        public Message message;
        @JsonProperty("finish_reason") public String finishReason;
        public Integer index;
    }
}