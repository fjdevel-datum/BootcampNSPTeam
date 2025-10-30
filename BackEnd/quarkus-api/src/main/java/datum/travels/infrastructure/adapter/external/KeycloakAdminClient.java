package datum.travels.infrastructure.adapter.external;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import datum.travels.shared.exception.KeycloakIntegrationException;
import jakarta.annotation.PostConstruct;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Cliente mínimo para invocar el API de administración de Keycloak.
 */
@ApplicationScoped
public class KeycloakAdminClient {

    private static final String TOKEN_ENDPOINT_TEMPLATE = "%s/realms/%s/protocol/openid-connect/token";
    private static final String USERS_ENDPOINT_TEMPLATE = "%s/admin/realms/%s/users";
    private static final String ROLE_ENDPOINT_TEMPLATE = "%s/admin/realms/%s/roles/%s";
    private static final String ROLE_MAPPING_ENDPOINT_TEMPLATE = "%s/admin/realms/%s/users/%s/role-mappings/realm";

    @ConfigProperty(name = "keycloak.admin.url")
    String keycloakUrl;

    @ConfigProperty(name = "keycloak.admin.realm")
    String realm;

    @ConfigProperty(name = "keycloak.admin.client-id", defaultValue = "admin-cli")
    String adminClientId;

    @ConfigProperty(name = "keycloak.admin.username")
    String adminUsername;

    @ConfigProperty(name = "keycloak.admin.password")
    String adminPassword;

    @ConfigProperty(name = "keycloak.admin.default-role", defaultValue = "usuario")
    String defaultRealmRole;

    @ConfigProperty(name = "keycloak.admin.auth-realm", defaultValue = "master")
    String adminAuthRealm;

    private static final Logger LOG = Logger.getLogger(KeycloakAdminClient.class);

    private final ObjectMapper objectMapper;
    private HttpClient httpClient;

    public KeycloakAdminClient(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    void init() {
        this.httpClient = HttpClient.newBuilder().build();
    }

    /**
     * Crea un usuario en Keycloak y devuelve su ID.
     *
     * @param username nombre de usuario
     * @param password contraseña inicial
     * @param firstName nombre
     * @param lastName apellido
     * @param email correo electrónico
     * @return ID del usuario en Keycloak
     */
    public String createUser(String username, String password, String firstName, String lastName, String email) {
        String adminToken = obtainAdminToken();

        String createUserUrl = USERS_ENDPOINT_TEMPLATE.formatted(keycloakUrl, realm);

        Map<String, Object> payload = new HashMap<>();
        payload.put("username", username);
        payload.put("enabled", Boolean.TRUE);
        payload.put("email", email);
        payload.put("firstName", firstName);
        payload.put("lastName", lastName);
        payload.put("emailVerified", Boolean.TRUE);
        payload.put("credentials", List.of(Map.of(
            "type", "password",
            "temporary", Boolean.FALSE,
            "value", password
        )));

        HttpRequest request = HttpRequest.newBuilder(URI.create(createUserUrl))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + adminToken)
            .POST(HttpRequest.BodyPublishers.ofString(writeJson(payload)))
            .build();

        HttpResponse<String> response = send(request);

        if (response.statusCode() == 409) {
            throw new KeycloakIntegrationException("El usuario ya existe en Keycloak");
        }

        if (response.statusCode() != 201) {
            String errorBody = Optional.ofNullable(response.body()).orElse("");
            throw new KeycloakIntegrationException(
                "No se pudo crear el usuario en Keycloak. Codigo: " + response.statusCode() + " Detalle: " + errorBody
            );
        }

        String location = response.headers()
            .firstValue("Location")
            .orElseThrow(() -> new KeycloakIntegrationException("Keycloak no retornó el Location del nuevo usuario"));

        String userId = extractUserIdFromLocation(location);

        assignRealmRole(adminToken, userId, defaultRealmRole);

        return userId;
    }

    /**
     * Elimina un usuario del realm de Keycloak (mejor esfuerzo).
     *
     * @param userId identificador del usuario en Keycloak
     */
    public void deleteUser(String userId) {
        if (isBlank(userId)) {
            return;
        }

        String token;
        try {
            token = obtainAdminToken();
        } catch (KeycloakIntegrationException ex) {
            LOG.warnf("No se pudo obtener token de administrador para eliminar usuario %s: %s", userId, ex.getMessage());
            return;
        }

        String endpoint = "%s/admin/realms/%s/users/%s".formatted(keycloakUrl, realm, userId);
        HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint))
            .header("Authorization", "Bearer " + token)
            .DELETE()
            .build();

        try {
            HttpResponse<String> response = send(request);
            int status = response.statusCode();
            if (status != 204 && status != 202 && status != 404) {
                LOG.warnf("No se pudo eliminar usuario %s en Keycloak. Codigo: %d. Detalle: %s",
                    userId, status, Optional.ofNullable(response.body()).orElse(""));
            }
        } catch (KeycloakIntegrationException ex) {
            LOG.warnf("Error al eliminar usuario %s en Keycloak: %s", userId, ex.getMessage());
        }
    }

    private void assignRealmRole(String token, String userId, String roleName) {
        JsonNode roleRepresentation = fetchRoleRepresentation(token, roleName);
        ArrayNode payload = objectMapper.createArrayNode().add(roleRepresentation);

        String endpoint = ROLE_MAPPING_ENDPOINT_TEMPLATE.formatted(keycloakUrl, realm, userId);

        HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + token)
            .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
            .build();

        HttpResponse<String> response = send(request);
        if (response.statusCode() != 204) {
            String errorBody = Optional.ofNullable(response.body()).orElse("");
            throw new KeycloakIntegrationException(
                "No se pudo asignar el rol por defecto en Keycloak. Codigo: " + response.statusCode() + " Detalle: " + errorBody
            );
        }
    }

    private JsonNode fetchRoleRepresentation(String token, String roleName) {
        String endpoint = ROLE_ENDPOINT_TEMPLATE.formatted(keycloakUrl, realm, urlEncode(roleName));

        HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint))
            .header("Authorization", "Bearer " + token)
            .GET()
            .build();

        HttpResponse<String> response = send(request);
        if (response.statusCode() != 200) {
            String errorBody = Optional.ofNullable(response.body()).orElse("");
            throw new KeycloakIntegrationException(
                "No se pudo obtener el rol '" + roleName + "' en Keycloak. Codigo: " + response.statusCode() + " Detalle: " + errorBody
            );
        }

        try {
            return objectMapper.readTree(response.body());
        } catch (IOException e) {
            throw new KeycloakIntegrationException("Error al procesar la respuesta del rol en Keycloak", e);
        }
    }

    private String obtainAdminToken() {
        if (isBlank(adminUsername) || isBlank(adminPassword)) {
            throw new KeycloakIntegrationException("Credenciales de administrador de Keycloak no configuradas");
        }

        HttpResponse<String> response = requestAdminTokenForRealm(adminAuthRealm);

        if (response.statusCode() != 200 && !adminAuthRealm.equals(realm)) {
            LOG.warnf("No se pudo autenticar en realm '%s' (status %d). Intentando con realm '%s'.",
                adminAuthRealm, response.statusCode(), realm);
            response = requestAdminTokenForRealm(realm);
        }

        if (response.statusCode() != 200) {
            String body = Optional.ofNullable(response.body()).orElse("");
            throw new KeycloakIntegrationException(
                "No se pudo obtener el token de administrador de Keycloak. Codigo: " + response.statusCode() + " Detalle: " + body
            );
        }

        try {
            JsonNode node = objectMapper.readTree(response.body());
            JsonNode tokenNode = node.get("access_token");
            if (tokenNode == null || tokenNode.isNull()) {
                throw new KeycloakIntegrationException("Respuesta de Keycloak sin access_token");
            }
            return tokenNode.asText();
        } catch (IOException e) {
            throw new KeycloakIntegrationException("Error al leer el token de Keycloak", e);
        }
    }

    private HttpResponse<String> requestAdminTokenForRealm(String realmForAuth) {
        String tokenEndpoint = TOKEN_ENDPOINT_TEMPLATE.formatted(keycloakUrl, realmForAuth);
        String form = "client_id=%s&username=%s&password=%s&grant_type=password".formatted(
            urlEncode(adminClientId),
            urlEncode(adminUsername),
            urlEncode(adminPassword)
        );

        HttpRequest request = HttpRequest.newBuilder(URI.create(tokenEndpoint))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString(form))
            .build();

        return send(request);
    }

    private HttpResponse<String> send(HttpRequest request) {
        try {
            return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new KeycloakIntegrationException("La llamada a Keycloak fue interrumpida", e);
        } catch (IOException e) {
            throw new KeycloakIntegrationException("Error de comunicación con Keycloak", e);
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (IOException e) {
            throw new KeycloakIntegrationException("Error al serializar payload para Keycloak", e);
        }
    }

    private String extractUserIdFromLocation(String location) {
        int lastSlash = location.lastIndexOf('/');
        if (lastSlash == -1 || lastSlash == location.length() - 1) {
            throw new KeycloakIntegrationException("No se pudo interpretar el Location devuelto por Keycloak: " + location);
        }
        return location.substring(lastSlash + 1);
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}

