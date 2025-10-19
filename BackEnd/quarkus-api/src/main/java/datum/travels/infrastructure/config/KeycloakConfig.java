package datum.travels.infrastructure.config;

import io.smallrye.config.ConfigMapping;
import io.smallrye.config.WithName;

/**
 * Configuración de Keycloak
 * 
 * Lee los valores de application.properties automáticamente
 * usando el sistema de configuración de Quarkus
 */
@ConfigMapping(prefix = "keycloak")
public interface KeycloakConfig {
    
    @WithName("server-url")
    String serverUrl();
    
    String realm();
    
    @WithName("client-id")
    String clientId();
    
    @WithName("client-secret")
    String clientSecret();
    
    @WithName("admin-username")
    String adminUsername();
    
    @WithName("admin-password")
    String adminPassword();
    
    @WithName("token-expiration")
    Integer tokenExpiration();
    
    @WithName("refresh-token-expiration")
    Integer refreshTokenExpiration();
}