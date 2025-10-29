package datum.travels.shared.util;

import datum.travels.domain.model.Usuario;
import datum.travels.domain.repository.UsuarioRepository;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.Optional;

/**
 * Utilidad para obtener el usuario actual autenticado
 * Combina información de Keycloak JWT con la BD local
 */
@RequestScoped
public class CurrentUserProvider {

    @Inject
    JsonWebToken jwt;

    @Inject
    SecurityIdentity securityIdentity;

    @Inject
    UsuarioRepository usuarioRepository;

    /**
     * Obtiene el Keycloak ID del usuario autenticado
     */
    public String getKeycloakId() {
        if (securityIdentity.isAnonymous()) {
            throw new IllegalStateException("No hay usuario autenticado");
        }
        return jwt.getSubject();
    }

    /**
     * Obtiene el username (preferred_username) del JWT
     */
    public String getUsername() {
        if (securityIdentity.isAnonymous()) {
            throw new IllegalStateException("No hay usuario autenticado");
        }
        
        // Intenta obtener preferred_username del JWT
        String username = jwt.getClaim("preferred_username");
        
        // Fallback: usa getName() si preferred_username no existe
        if (username == null) {
            username = jwt.getName();
        }
        
        // Fallback final: usa el subject (UUID) si nada más funciona
        if (username == null) {
            username = jwt.getSubject();
        }
        
        return username;
    }

    /**
     * Busca el Usuario completo en la BD usando el keycloak_id
     * Si no existe, lo crea/vincula automáticamente
     */
    public Optional<Usuario> getUsuario() {
        String keycloakId = getKeycloakId();
        return usuarioRepository.findByKeycloakId(keycloakId);
    }

    /**
     * Obtiene el ID del empleado asociado al usuario autenticado
     */
    public Optional<Long> getIdEmpleado() {
        return getUsuario()
            .map(Usuario::getIdEmpleado);
    }
}
