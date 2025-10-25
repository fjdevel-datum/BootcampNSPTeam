package datum.travels.infrastructure.adapter.keycloak;

import datum.travels.domain.exception.AuthenticationException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.core.Form;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.util.Map;

/**
 * Servicio de autenticación con Keycloak
 * 
 * Responsabilidades:
 * - Conectar con Keycloak Token Endpoint
 * - Enviar credenciales usando OAuth2 Password Grant
 * - Obtener JWT firmado por Keycloak
 * - Manejar errores de autenticación
 * 
 * Arquitectura:
 * - Infrastructure Layer (Adapter)
 * - Implementa integración con Keycloak
 * - Usado por LoginUseCase en Application Layer
 */
@ApplicationScoped
public class KeycloakAuthenticationService {

    private static final Logger LOG = Logger.getLogger(KeycloakAuthenticationService.class);

    @ConfigProperty(name = "keycloak.server-url")
    String keycloakServerUrl;

    @ConfigProperty(name = "keycloak.realm")
    String realm;

    @ConfigProperty(name = "keycloak.client-id")
    String clientId;

    @ConfigProperty(name = "keycloak.client-secret")
    String clientSecret;

    /**
     * Autentica un usuario con Keycloak usando OAuth2 Password Grant
     * 
     * Este método hace exactamente lo mismo que tu prueba con curl:
     * 
     * curl -X POST http://localhost:8180/realms/datum-travels/protocol/openid-connect/token
     *   -d "grant_type=password"
     *   -d "client_id=datum-travels-backend"
     *   -d "client_secret=xxx"
     *   -d "username=carlos.test"
     *   -d "password=test123"
     *
     * @param username Usuario (usuarioApp)
     * @param password Contraseña sin hashear
     * @return Token JWT firmado por Keycloak (access_token)
     * @throws AuthenticationException Si las credenciales son inválidas o hay error de conexión
     */
    public String authenticate(String username, String password) {
        LOG.infof("🔐 Autenticando usuario '%s' con Keycloak", username);

        // Construir URL del token endpoint
        String tokenEndpoint = String.format(
            "%s/realms/%s/protocol/openid-connect/token",
            keycloakServerUrl,
            realm
        );

        LOG.infof("📍 Token endpoint: %s", tokenEndpoint);
        LOG.infof("📋 Client ID: %s", clientId);
        LOG.infof("🔑 Client Secret: %s", clientSecret != null ? "***" + clientSecret.substring(Math.max(0, clientSecret.length() - 4)) : "NULL");

        // Construir formulario OAuth2 Password Grant
        Form form = new Form()
            .param("grant_type", "password")
            .param("client_id", clientId)
            .param("client_secret", clientSecret)
            .param("username", username)
            .param("password", password);

        // Crear cliente HTTP
        Client client = ClientBuilder.newClient();
        
        try {
            // Hacer POST a Keycloak
            LOG.infof("📤 Enviando credenciales a Keycloak...");
            LOG.debugf("   Username: %s", username);
            LOG.debugf("   Password length: %d chars", password != null ? password.length() : 0);
            
            Response response = client.target(tokenEndpoint)
                .request(MediaType.APPLICATION_JSON)
                .post(Entity.form(form));

            int status = response.getStatus();
            LOG.infof("📥 Respuesta de Keycloak: Status %d", status);

            // Procesar respuesta
            if (status == 200) {
                // Autenticación exitosa
                @SuppressWarnings("unchecked")
                Map<String, Object> tokenResponse = response.readEntity(Map.class);
                String accessToken = (String) tokenResponse.get("access_token");
                
                if (accessToken == null || accessToken.isEmpty()) {
                    LOG.errorf("Keycloak retornó status 200 pero sin access_token");
                    throw new AuthenticationException("Error al obtener token de autenticación");
                }
                
                LOG.infof("✅ Autenticación exitosa para usuario '%s'", username);
                LOG.debugf("Token JWT obtenido (primeros 50 caracteres): %s...", 
                    accessToken.substring(0, Math.min(50, accessToken.length())));
                
                return accessToken;
                
            } else if (status == 401) {
                // Credenciales inválidas
                String errorBody = "";
                try {
                    errorBody = response.readEntity(String.class);
                    LOG.errorf("❌ Respuesta 401 de Keycloak: %s", errorBody);
                } catch (Exception e) {
                    LOG.errorf("❌ No se pudo leer el body del error 401");
                }
                LOG.warnf("❌ Credenciales inválidas para usuario '%s'", username);
                throw new AuthenticationException("Credenciales inválidas");
                
            } else if (status == 400) {
                // Request malformado
                String errorBody = response.readEntity(String.class);
                LOG.errorf("❌ Request inválido a Keycloak (400): %s", errorBody);
                throw new AuthenticationException("Error en la solicitud de autenticación");
                
            } else {
                // Otro error (500, 503, etc.)
                String errorBody = "";
                try {
                    errorBody = response.readEntity(String.class);
                    LOG.errorf("❌ Error inesperado de Keycloak (Status %d): %s", status, errorBody);
                } catch (Exception e) {
                    LOG.errorf("❌ Error inesperado de Keycloak: Status %d (no se pudo leer body)", status);
                }
                throw new AuthenticationException("Error del servidor de autenticación");
            }
            
        } catch (AuthenticationException e) {
            // Re-lanzar excepciones de autenticación
            throw e;
            
        } catch (Exception e) {
            // Error de conexión u otro error técnico
            LOG.errorf(e, "❌ Error al conectar con Keycloak para usuario '%s'", username);
            throw new AuthenticationException(
                "Error de conexión con el servidor de autenticación. Verifica que Keycloak esté corriendo.", 
                e
            );
            
        } finally {
            client.close();
        }
    }

    /**
     * Valida un token JWT con Keycloak (usando introspection endpoint)
     * 
     * NOTA: Por ahora, Quarkus OIDC valida automáticamente los tokens.
     * Este método está para futuras implementaciones si necesitamos
     * validación manual o logout de tokens.
     * 
     * @param token Token JWT a validar
     * @return true si el token es válido y activo
     */
    public boolean validateToken(String token) {
        // TODO: Implementar si es necesario
        // Por ahora Quarkus OIDC se encarga de la validación automática
        LOG.debugf("Validación de token delegada a Quarkus OIDC");
        return true;
    }

    /**
     * Obtiene información del servidor Keycloak (para debugging)
     * 
     * @return Información de configuración
     */
    public String getKeycloakInfo() {
        return String.format(
            "Keycloak Server: %s, Realm: %s, Client: %s",
            keycloakServerUrl,
            realm,
            clientId
        );
    }
}
