package org.acme.ocrquarkus.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Sube cada archivo procesado al repositorio OpenKM usando su interfaz WebDAV.
 */
@ApplicationScoped
public class OpenKmStorageService {

    private static final Logger LOG = Logger.getLogger(OpenKmStorageService.class);

    private final boolean enabled;
    private final boolean failOnError;
    private final HttpClient httpClient;
    private final URI baseUri;
    private final URI restBaseUri;
    private final String authorizationHeader;
    private final List<String> rootSegments;
    private final boolean rootHasFixedNode;
    private static final Pattern GETETAG_PATTERN = Pattern.compile("<[^>]*getetag[^>]*>([^<]+)</");
    private static final String PROPFIND_GETETAG_BODY = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
            + "<propfind xmlns=\"DAV:\"><prop><getetag/></prop></propfind>";

    public OpenKmStorageService(
            @ConfigProperty(name = "openkm.enabled", defaultValue = "false") boolean enabled,
            @ConfigProperty(name = "openkm.fail-on-error", defaultValue = "true") boolean failOnError,
            @ConfigProperty(name = "openkm.webdav-url", defaultValue = "http://localhost:8081/webdav/") String webDavUrl,
            @ConfigProperty(name = "openkm.collection-root", defaultValue = "okm:root/gastos") String collectionRoot,
            @ConfigProperty(name = "openkm.username", defaultValue = "okmAdmin") String username,
            @ConfigProperty(name = "openkm.password", defaultValue = "admin") String password,
            @ConfigProperty(name = "openkm.root-fixed-node", defaultValue = "true") boolean rootHasFixedNode
    ) {
        this.enabled = enabled;
        this.failOnError = failOnError;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(20))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();

        if (enabled) {
            this.baseUri = URI.create(ensureTrailingSlash(webDavUrl));
            this.restBaseUri = deriveRestBaseUri(this.baseUri);
            this.authorizationHeader = buildBasicAuth(username, password);
            this.rootSegments = List.copyOf(parseSegments(collectionRoot));
            this.rootHasFixedNode = rootHasFixedNode;
        } else {
            this.baseUri = null;
            this.restBaseUri = null;
            this.authorizationHeader = null;
            this.rootSegments = Collections.emptyList();
            this.rootHasFixedNode = true;
        }
    }

    /**
     * Replica el archivo en OpenKM bajo la ruta configurada (gastos/{gastoId}/archivo).
     * @return Ruta relativa dentro de OpenKM si se sube correctamente.
     */
    public Optional<String> store(Long gastoId, String originalFileName, byte[] contents, String contentType) {
        if (!enabled) {
            return Optional.empty();
        }

        String safeName = sanitizeFileName(originalFileName);
        List<String> folder = new ArrayList<>(rootSegments);
        folder.add(String.valueOf(gastoId));
        List<String> document = new ArrayList<>(folder);
        document.add(safeName);

        try {
            ensureCollections(folder);
            uploadDocument(document, contents, normalizeContentType(contentType));
            String okmPath = String.join("/", document);
            LOG.debugf("Documento de gasto #%s replicado en OpenKM en %s", gastoId, okmPath);
            try {
                return fetchUuidFromWebDav(document);
            } catch (IOException | InterruptedException e) {
                LOG.warnf(e, "No se pudo obtener el UUID del documento %s vA­a WebDAV, probando REST", okmPath);
                try {
                    return fetchUuidFromPath(okmPath);
                } catch (IOException | InterruptedException ex) {
                    LOG.warnf(ex, "No se pudo obtener el UUID del documento %s vA­a REST", okmPath);
                    return Optional.empty();
                }
            }
        } catch (Exception ex) {
            LOG.errorf(ex, "Error replicando documento de gasto #%s en OpenKM", gastoId);
            if (failOnError) {
                throw new IllegalStateException("No se pudo guardar el archivo en OpenKM", ex);
            }
            return Optional.empty();
        }
    }

    private void ensureCollections(List<String> segments) throws IOException, InterruptedException {
        List<String> current = new ArrayList<>();
        for (int i = 0; i < segments.size(); i++) {
            String segment = segments.get(i);
            current.add(segment);

            if (rootHasFixedNode && i == 0) {
                // okm:root ya existe de fA¡brica en OpenKM; no intentes crearlo.
                continue;
            }

            HttpRequest request = HttpRequest.newBuilder(resolve(joinSegments(current)))
                    .header("Authorization", authorizationHeader)
                    .timeout(Duration.ofSeconds(15))
                    .method("MKCOL", HttpRequest.BodyPublishers.noBody())
                    .build();

            HttpResponse<Void> response = httpClient.send(request, HttpResponse.BodyHandlers.discarding());
            int status = response.statusCode();
            if (status == 201 || status == 405 || status == 409) {
                continue; // creado, ya existA­a o raA­z protegida
            }
            if (status >= 200 && status < 300) {
                continue;
            }
            throw new IllegalStateException("MKCOL " + joinSegments(current) + " => " + status);
        }
    }

    private void uploadDocument(List<String> pathSegments, byte[] payload, String contentType) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(resolve(joinSegments(pathSegments)))
                .header("Authorization", authorizationHeader)
                .header("Content-Type", contentType)
                .timeout(Duration.ofSeconds(60))
                .PUT(HttpRequest.BodyPublishers.ofByteArray(payload))
                .build();

        HttpResponse<Void> response = httpClient.send(request, HttpResponse.BodyHandlers.discarding());
        int status = response.statusCode();
        if (status < 200 || status >= 300) {
            throw new IllegalStateException("PUT " + String.join("/", pathSegments) + " => " + status);
        }
    }

    private URI resolve(String encodedPath) {
        return URI.create(baseUri.toString() + encodedPath);
    }

    private Optional<String> fetchUuidFromWebDav(List<String> pathSegments) throws IOException, InterruptedException {
        if (baseUri == null) {
            return Optional.empty();
        }
        String encodedPath = joinSegments(pathSegments);
        HttpRequest request = HttpRequest.newBuilder(resolve(encodedPath))
                .header("Authorization", authorizationHeader)
                .header("Depth", "0")
                .header("Content-Type", "text/xml")
                .timeout(Duration.ofSeconds(20))
                .method("PROPFIND", HttpRequest.BodyPublishers.ofString(PROPFIND_GETETAG_BODY))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        int status = response.statusCode();
        if (status == 207 || (status >= 200 && status < 300)) {
            String body = response.body();
            if (body != null) {
                Matcher matcher = GETETAG_PATTERN.matcher(body);
                if (matcher.find()) {
                    String rawTag = matcher.group(1);
                    int idx = rawTag.indexOf('_');
                    String uuid = (idx > 0) ? rawTag.substring(0, idx) : rawTag;
                    return Optional.of(uuid);
                }
            }
        } else {
            LOG.warnf("OpenKM PROPFIND %s => %s", encodedPath, status);
        }
        return Optional.empty();
    }

    private Optional<String> fetchUuidFromPath(String okmPath) throws IOException, InterruptedException {
        if (restBaseUri == null) {
            return Optional.empty();
        }
        String encoded = URLEncoder.encode("/" + okmPath, StandardCharsets.UTF_8);
        URI endpoint = URI.create(restBaseUri.toString() + "document/getUuidFromPath?path=" + encoded);

        HttpRequest request = HttpRequest.newBuilder(endpoint)
                .header("Authorization", authorizationHeader)
                .timeout(Duration.ofSeconds(20))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        int status = response.statusCode();
        if (status >= 200 && status < 300) {
            String body = response.body();
            if (body != null) {
                String trimmed = body.trim();
                if (trimmed.startsWith("\"") && trimmed.endsWith("\"") && trimmed.length() >= 2) {
                    trimmed = trimmed.substring(1, trimmed.length() - 1);
                }
                return Optional.of(trimmed);
            }
        } else {
            LOG.warnf("OpenKM getUuidFromPath %s => %s", okmPath, status);
        }
        return Optional.empty();
    }

    private String joinSegments(List<String> segments) {
        return segments.stream()
                .map(this::encodeSegment)
                .collect(Collectors.joining("/"));
    }

    private List<String> parseSegments(String rawPath) {
        return Arrays.stream(rawPath.split("/"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private String encodeSegment(String segment) {
        String sanitized = segment.replace("\\", "_").trim();
        if (sanitized.isEmpty()) {
            sanitized = "_";
        }
        String encoded = URLEncoder.encode(sanitized, StandardCharsets.UTF_8);
        return encoded.replace("+", "%20")
                .replace("%2F", "/")
                .replace("%3A", ":");
    }

    private String ensureTrailingSlash(String url) {
        return url.endsWith("/") ? url : url + "/";
    }

    private URI deriveRestBaseUri(URI webdavUri) {
        String base = webdavUri.toString();
        int idx = base.lastIndexOf("/webdav/");
        String root = idx >= 0 ? base.substring(0, idx + 1) : base;
        return URI.create(ensureTrailingSlash(root) + "services/rest/");
    }

    private String buildBasicAuth(String username, String password) {
        String token = username + ":" + password;
        return "Basic " + Base64.getEncoder().encodeToString(token.getBytes(StandardCharsets.UTF_8));
    }

    private String sanitizeFileName(String original) {
        if (original == null || original.isBlank()) {
            return "archivo-" + UUID.randomUUID();
        }
        return original.replace("/", "_").replace("\\", "_").trim();
    }

    private String normalizeContentType(String contentType) {
        return (contentType == null || contentType.isBlank()) ? "application/octet-stream" : contentType;
    }
}

