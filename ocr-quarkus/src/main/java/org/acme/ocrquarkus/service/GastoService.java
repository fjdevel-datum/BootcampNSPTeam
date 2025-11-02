package org.acme.ocrquarkus.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import org.acme.ocrquarkus.entity.Gasto;
import org.acme.ocrquarkus.repository.GastoRepository;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.DateTimeParseException;
import java.time.format.TextStyle;
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

    @Inject
    OpenKmStorageService openKmStorageService;
    
    @Transactional
    public Gasto guardarGastoDesdeJson(String jsonStr) throws IOException {
        System.out.println("JSON recibido en GastoService: " + jsonStr);
        JsonNode json = objectMapper.readTree(jsonStr);
        
        String nombreEmpresa = json.has("NombreEmpresa") ? json.get("NombreEmpresa").asText() :
                             json.has("Nombre de la empresa") ? json.get("Nombre de la empresa").asText().split(",")[0].trim() :
                             "Desconocido";

        Long idEvento = extractLong(json, true, "IdEvento", "idEvento");
        Long idTarjeta = extractLong(json, false, "IdTarjeta", "idTarjeta");
        Long idCategoria = extractLong(json, false, "IdCategoria", "idCategoria");
        
        String descripcion = json.has("Descripcion") ? json.get("Descripcion").asText() : "";
        if (descripcion.length() > 50) {
            descripcion = descripcion.substring(0, 47) + "...";
        }

        String montoStr = json.has("MontoTotal") ? json.get("MontoTotal").asText().replace("$", "").trim() : "0";
        BigDecimal montoTotal = parseMonto(montoStr);

        String fechaStr = json.has("Fecha") ? json.get("Fecha").asText()
                : json.has("fecha") ? json.get("fecha").asText()
                : null;
        LocalDate fecha = parseFecha(fechaStr);

        Gasto gasto = new Gasto();
        gasto.lugar = nombreEmpresa;
        gasto.descripcion = descripcion;
        gasto.monto = montoTotal;
        gasto.fecha = fecha;
        gasto.idEvento = idEvento;
        gasto.idTarjeta = idTarjeta;
        gasto.idCategoria = idCategoria;

        gastoRepository.persist(gasto);
        return gasto;
    }

    // =============== Archivos en Azure (por gasto) ===============

    @Transactional
    public Gasto attachFile(Long gastoId, byte[] bytes, String originalName, String contentType, String userName) {
        Gasto g = gastoRepository.findById(gastoId);
        if (g == null) throw new NotFoundException("Gasto no encontrado: " + gastoId);

        String safeName = sanitizeFileName(originalName);
        String userFolder = sanitizeUserFolder(userName);
        String[] dateSegments = buildDateSegments(g.fecha);
        String storagePrefix = buildBlobPath(userFolder, dateSegments);
        String storageFileName = buildStorageFileName(gastoId, safeName);
        String blobName = storagePrefix + storageFileName;
        String ct = (contentType == null || contentType.isBlank())
                ? "application/octet-stream" : contentType;

        InputStream in = new ByteArrayInputStream(bytes);

        String url = azureStorageService.upload(blobName, in, bytes.length, ct);

        g.setBlobName(blobName);
        g.setBlobUrl(url);
        g.setFileContentType(ct);
        g.setFileSize((long) bytes.length);
        g.setOpenkmDocUuid(
                openKmStorageService
                        .store(g.idGasto, storageFileName, bytes, ct, userFolder, dateSegments)
                        .orElse(null)
        );

        return g;
    }

    public byte[] downloadFile(Long gastoId) throws Exception {
        Gasto g = gastoRepository.findById(gastoId);
        if (g == null || g.getBlobName() == null) {
            throw new NotFoundException("Gasto o archivo no encontrado");
        }
        return azureStorageService.download(g.getBlobName());
    }

    @Transactional
    public boolean removeFile(Long gastoId) {
        Gasto g = gastoRepository.findById(gastoId);
        if (g == null || g.getBlobName() == null) return false;

        boolean deleted = azureStorageService.delete(g.getBlobName());

        g.setBlobName(null);
        g.setBlobUrl(null);
        g.setFileContentType(null);
        g.setFileSize(null);
        g.setOpenkmDocUuid(null);
        return deleted;
    }

    public String buildTempReadUrl(Long gastoId, int minutes) {
        Gasto g = gastoRepository.findById(gastoId);
        if (g == null || g.getBlobName() == null) {
            throw new NotFoundException("Gasto o archivo no encontrado");
        }
        return azureStorageService.buildReadSasUrl(g.getBlobName(), minutes);
    }

    private BigDecimal parseMonto(String rawValue) {
        if (rawValue == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        String cleaned = rawValue.trim();
        if (cleaned.isEmpty()) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        // Mantiene soporte para distintos formatos (1.234,50 | 1,234.50 | 1234.50)
        try {
            String numeric = cleaned.replaceAll("[^0-9,.-]", "");
            if (numeric.isEmpty()) {
                return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
            }
            int lastComma = numeric.lastIndexOf(',');
            int lastDot = numeric.lastIndexOf('.');
            if (lastComma > lastDot) {
                numeric = numeric.replace(".", "").replace(',', '.');
            } else {
                numeric = numeric.replace(",", "");
            }
            BigDecimal value = new BigDecimal(numeric);
            return value.setScale(2, RoundingMode.HALF_UP);
        } catch (NumberFormatException ex) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
    }

    private Long extractLong(JsonNode json, boolean required, String... names) {
        for (String name : names) {
            if (json.has(name) && !json.get(name).isNull()) {
                JsonNode node = json.get(name);
                if (node.isNumber()) {
                    return node.longValue();
                }
                if (node.isTextual()) {
                    String text = node.asText().trim();
                    if (!text.isEmpty()) {
                        try {
                            return Long.parseLong(text);
                        } catch (NumberFormatException ignored) {
                        }
                    }
                }
            }
        }
        if (required) {
            throw new BadRequestException("Falta o es invalido el campo " + names[0]);
        }
        return null;
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
            }
        }
        return null;
    }

    private String sanitizeUserFolder(String rawUserName) {
        return sanitizePathSegment(rawUserName, "sin-usuario");
    }

    private String sanitizePathSegment(String rawValue, String fallback) {
        if (rawValue == null) {
            return fallback;
        }
        String sanitized = rawValue.trim();
        if (sanitized.isEmpty()) {
            return fallback;
        }
        sanitized = sanitized
                .replace("\\", "-")
                .replace("/", "-")
                .replaceAll("[:*?\"<>|]+", "")
                .replaceAll("\\s{2,}", " ");
        return sanitized.isEmpty() ? fallback : sanitized;
    }

    private String sanitizeFileName(String originalName) {
        String fallback = "file-" + UUID.randomUUID();
        if (originalName == null || originalName.isBlank()) {
            return fallback;
        }
        String sanitized = originalName.trim()
                .replace("\\", "-")
                .replace("/", "-")
                .replaceAll("[:*?\"<>|]+", "")
                .replaceAll("\\s{2,}", " ");
        return sanitized.isEmpty() ? fallback : sanitized;
    }

    private String[] buildDateSegments(LocalDate fecha) {
        LocalDate today = LocalDate.now();
        LocalDate effective = (fecha != null && (fecha.isBefore(today) || fecha.isEqual(today)))
                ? fecha
                : today;
        Locale localeEs = new Locale("es", "ES");

        String year = sanitizePathSegment(String.valueOf(effective.getYear()), "sin-fecha");
        String monthName = effective.getMonth().getDisplayName(TextStyle.FULL, localeEs);
        monthName = capitalize(monthName, localeEs);
        String month = sanitizePathSegment(monthName, "sin-fecha");

        return new String[]{year, month};
    }

    private String buildBlobPath(String userFolder, String[] dateSegments) {
        StringBuilder builder = new StringBuilder("gastos/")
                .append(userFolder)
                .append("/");
        for (String segment : dateSegments) {
            builder.append(segment).append("/");
        }
        return builder.toString();
    }

    private String buildStorageFileName(Long gastoId, String safeName) {
        String prefix = (gastoId != null) ? gastoId + "-" : "";
        return prefix + safeName;
    }

    private String capitalize(String value, Locale locale) {
        if (value == null || value.isBlank()) {
            return value;
        }
        String normalized = value.trim().toLowerCase(locale);
        return normalized.substring(0, 1).toUpperCase(locale) + normalized.substring(1);
    }
}
