package datum.travels.infrastructure.security;

import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.jwt.JsonWebToken;

/**
 * Filtro que intercepta requests autenticados y expone información del usuario
 * Extrae el 'sub' (subject) del JWT que contiene el Keycloak ID
 */
@Provider
public class UsuarioContextFilter implements ContainerRequestFilter {

    @Inject
    JsonWebToken jwt;

    @Inject
    SecurityIdentity securityIdentity;

    @Override
    public void filter(ContainerRequestContext requestContext) {
        if (securityIdentity.isAnonymous()) {
            return;
        }

        // El 'sub' del JWT contiene el Keycloak ID (UUID)
        String keycloakId = jwt.getSubject();
        String username = jwt.getName(); // preferred_username
        
        // Opcional: Log para debugging
        System.out.println("🔐 Usuario autenticado: " + username + " (Keycloak ID: " + keycloakId + ")");
        
        // Guardamos en el contexto de la request para uso posterior
        requestContext.setProperty("keycloak.user.id", keycloakId);
        requestContext.setProperty("keycloak.user.name", username);
    }
}
