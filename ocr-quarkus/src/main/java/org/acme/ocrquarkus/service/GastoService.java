package org.acme.ocrquarkus.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import org.acme.ocrquarkus.entity.Gasto;
import org.acme.ocrquarkus.repository.GastoRepository;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoField;
import java.util.Locale;
import java.util.UUID;

@ApplicationScoped
public class GastoService {

    private static final DateTimeFormatter[] SUPPORTED_DATE_FORMATS = new DateTimeFormatter[]{
            DateTimeFormatter.ISO_LOCAL_DATE,
            DateTimeFormatter.ofPattern("dd/MM/uuuu"),
            new DateTimeFormatterBuilder()
                    .appendPattern("dd/MM/")
                    .appendValueReduced(ChronoField.YEAR, 2, 2, 2000)
                    .toFormatter(),
            DateTimeFormatter.ofPattern("MM/dd/uuuu"),
            new DateTimeFormatterBuilder()
                    .appendPattern("MM/dd/")
                    .appendValueReduced(ChronoField.YEAR, 2, 2, 2000)
                    .toFormatter(),
            new DateTimeFormatterBuilder()
                    .parseCaseInsensitive()
                    .appendPattern("MMM d, uuuu")
                    .toFormatter(Locale.ENGLISH),
            new DateTimeFormatterBuilder()
                    .parseCaseInsensitive()
                    .appendPattern("MMM d, ")
                    .appendValueReduced(ChronoField.YEAR, 2, 2, 2000)
                    .toFormatter(Locale.ENGLISH),
            new DateTimeFormatterBuilder()
                    .parseCaseInsensitive()
                    .appendPattern("MMM d uuuu")
                    .toFormatter(Locale.ENGLISH),
            new DateTimeFormatterBuilder()
                    .parseCaseInsensitive()
                    .appendPattern("MMM d ")
                    .appendValueReduced(ChronoField.YEAR, 2, 2, 2000)
                    .toFormatter(Locale.ENGLISH)
    };

    @Inject
    GastoRepository gastoRepository;

    @Inject
    ObjectMapper objectMapper;

    @Inject
    AzureStorageService azureStorageService;
    
    @Transactional
    public Gasto guardarGastoDesdeJson(String jsonStr) throws IOException {
        System.out.println("JSON recibido en GastoService: " + jsonStr);
        JsonNode json = objectMapper.readTree(jsonStr);
        
        // Extraer datos del JSON
        String nombreEmpresa = json.has("NombreEmpresa") ? json.get("NombreEmpresa").asText() :
                             json.has("Nombre de la empresa") ? json.get("Nombre de la empresa").asText().split(",")[0].trim() :
                             "Desconocido";
        
        String descripcion = json.has("Descripcion") ? json.get("Descripcion").asText() : "";
        // Truncar la descripción si excede los 50 caracteres
        if (descripcion.length() > 50) {
            descripcion = descripcion.substring(0, 47) + "...";
        }

        // Obtener monto total (mantener formato original)
        // Procesar monto: eliminar símbolo $ y convertir a Double
        String montoStr = json.has("MontoTotal") ? json.get("MontoTotal").asText().replace("$", "").trim() : "0";
        Double montoTotal = Double.parseDouble(montoStr);

        String fechaStr = json.has("Fecha") ? json.get("Fecha").asText()
                : json.has("fecha") ? json.get("fecha").asText()
                : null;
        LocalDate fecha = parseFecha(fechaStr);

        // Extraer ID de categoría (nuevo campo)
        Long idCategoria = null;
        if (json.has("IdCategoria") && !json.get("IdCategoria").isNull()) {
            idCategoria = json.get("IdCategoria").asLong();
        }

        // Crear y guardar el gasto
        Gasto gasto = new Gasto();
        gasto.lugar = nombreEmpresa;
        gasto.descripcion = descripcion;
        gasto.monto = montoTotal;
        gasto.fecha = fecha;
        gasto.idCategoria = idCategoria;

        gastoRepository.persist(gasto);
        return gasto;
    }

    // =============== 📦 ARCHIVOS EN AZURE (por gasto) ===============

    /**
     * Sube un archivo a Azure y lo asocia al gasto (sobrescribe si ya tenía).
     * @param gastoId id del gasto
     * @param bytes contenido del archivo
     * @param originalName nombre para guardar (p.ej. factura.pdf)
     * @param contentType MIME (image/png, application/pdf, …)
     */
    @Transactional
    public Gasto attachFile(Long gastoId, byte[] bytes, String originalName, String contentType) {
        Gasto g = gastoRepository.findById(gastoId);
        if (g == null) throw new NotFoundException("Gasto no encontrado: " + gastoId);

        String safeName = (originalName == null || originalName.isBlank())
                ? "file-" + UUID.randomUUID()
                : originalName.trim();

        String blobName = "gastos/" + gastoId + "/" + safeName;

        InputStream in = new ByteArrayInputStream(bytes);
        String ct = (contentType == null || contentType.isBlank())
                ? "application/octet-stream" : contentType;

        String url = azureStorageService.upload(blobName, in, bytes.length, ct);

        // Guarda metadata en la fila
        g.setBlobName(blobName);
        g.setBlobUrl(url);
        g.setFileContentType(ct);
        g.setFileSize((long) bytes.length);

        return g;
    }

    /**
     * Descarga el archivo asociado a un gasto.
     */
    public byte[] downloadFile(Long gastoId) throws Exception {
        Gasto g = gastoRepository.findById(gastoId);
        if (g == null || g.getBlobName() == null) {
            throw new NotFoundException("Gasto o archivo no encontrado");
        }
        return azureStorageService.download(g.getBlobName());
    }

    /**
     * Elimina el archivo en Azure y limpia las columnas del gasto.
     */
    @Transactional
    public boolean removeFile(Long gastoId) {
        Gasto g = gastoRepository.findById(gastoId);
        if (g == null || g.getBlobName() == null) return false;

        boolean deleted = azureStorageService.delete(g.getBlobName());

        g.setBlobName(null);
        g.setBlobUrl(null);
        g.setFileContentType(null);
        g.setFileSize(null);
        return deleted;
    }

    /**
     * Genera una URL temporal (SAS) de solo lectura para abrir/mostrar el archivo en el frontend.
     * @param minutes minutos de validez del enlace
     */
    public String buildTempReadUrl(Long gastoId, int minutes) {
        Gasto g = gastoRepository.findById(gastoId);
        if (g == null || g.getBlobName() == null) {
            throw new NotFoundException("Gasto o archivo no encontrado");
        }
        return azureStorageService.buildReadSasUrl(g.getBlobName(), minutes);
    }

    private LocalDate parseFecha(String rawValue) {
        if (rawValue == null) {
            return null;
        }
        String candidate = rawValue.trim();
        if (candidate.isEmpty()) {
            return null;
        }

        for (DateTimeFormatter formatter : SUPPORTED_DATE_FORMATS) {
            try {
                return LocalDate.parse(candidate, formatter);
            } catch (DateTimeParseException ignored) {
                // probar el siguiente formato conocido
            }
        }
        return null;
    }
}
