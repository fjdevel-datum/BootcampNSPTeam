package datum.travels.infrastructure.adapter.security;

import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;

import java.util.Set;

/**
 * Helper para obtener información del usuario actual autenticado
 * 
 * Este servicio facilita la obtención de datos del usuario
 * desde el token JWT de Keycloak en cualquier Use Case o Service.
 * 
 * Uso:
 * <pre>
 * @Inject
 * CurrentUserService currentUser;
 * 
 * String username = currentUser.getUsername();
 * Set<String> roles = currentUser.getRoles();
 * boolean isAdmin = currentUser.hasRole("admin");
 * </pre>
 */
@ApplicationScoped
public class CurrentUserService {

    private static final Logger LOG = Logger.getLogger(CurrentUserService.class);

    @Inject
    JsonWebToken jwt;

    @Inject
    SecurityIdentity securityIdentity;

    /**
     * Obtiene el username del usuario actual
     * 
     * @return username (ej: "carlos.test")
     */
    public String getUsername() {
        if (jwt != null && jwt.getName() != null) {
            return jwt.getName();
        }
        return "anonymous";
    }

    /**
     * Obtiene el email del usuario actual
     * 
     * @return email (ej: "carlos@datum.com")
     */
    public String getEmail() {
        if (jwt != null && jwt.containsClaim("email")) {
            return jwt.getClaim("email");
        }
        return null;
    }

    /**
     * Obtiene el nombre completo del usuario actual
     * 
     * @return nombre completo (ej: "Carlos Test")
     */
    public String getFullName() {
        if (jwt != null && jwt.containsClaim("name")) {
            return jwt.getClaim("name");
        }
        return null;
    }

    /**
     * Obtiene todos los roles del usuario actual
     * 
     * @return Set de roles (ej: ["empleado", "admin"])
     */
    public Set<String> getRoles() {
        if (jwt != null) {
            return jwt.getGroups();
        }
        return Set.of();
    }

    /**
     * Verifica si el usuario tiene un rol específico
     * 
     * @param role Rol a verificar (ej: "admin")
     * @return true si el usuario tiene el rol
     */
    public boolean hasRole(String role) {
        return getRoles().contains(role);
    }

    /**
     * Verifica si el usuario es administrador
     * 
     * @return true si tiene rol "admin"
     */
    public boolean isAdmin() {
        return hasRole("admin");
    }

    /**
     * Verifica si el usuario está autenticado
     * 
     * @return true si hay un usuario autenticado
     */
    public boolean isAuthenticated() {
        return securityIdentity != null && !securityIdentity.isAnonymous();
    }

    /**
     * Obtiene el token JWT completo (para debugging)
     * 
     * @return Raw JWT string
     */
    public String getRawToken() {
        if (jwt != null && jwt.getRawToken() != null) {
            return jwt.getRawToken();
        }
        return null;
    }

    /**
     * Log de información del usuario actual (para debugging)
     */
    public void logUserInfo() {
        if (isAuthenticated()) {
            LOG.infof("👤 Usuario actual: %s (%s)", getUsername(), getEmail());
            LOG.infof("📋 Roles: %s", getRoles());
        } else {
            LOG.warn("⚠️  No hay usuario autenticado");
        }
    }

    /**
     * Obtiene información completa del usuario en formato String
     * 
     * @return Información del usuario
     */
    public String getUserInfo() {
        if (!isAuthenticated()) {
            return "Usuario no autenticado";
        }

        return String.format(
            "Usuario: %s | Email: %s | Roles: %s",
            getUsername(),
            getEmail(),
            getRoles()
        );
    }
}
