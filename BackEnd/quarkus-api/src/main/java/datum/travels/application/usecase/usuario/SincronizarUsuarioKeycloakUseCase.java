package datum.travels.application.usecase.usuario;

import datum.travels.domain.model.Usuario;
import datum.travels.domain.repository.UsuarioRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.Optional;

/**
 * Caso de uso para sincronizar el usuario de Keycloak con la BD local
 */
@ApplicationScoped
public class SincronizarUsuarioKeycloakUseCase {

    @Inject
    UsuarioRepository usuarioRepository;

    /**
     * Vincula o actualiza el keycloak_id del usuario
     * 
     * @param usuarioApp nombre de usuario (debe existir en BD)
     * @param keycloakId ID generado por Keycloak
     * @return Usuario actualizado
     */
    @Transactional
    public Usuario vincularKeycloakId(String usuarioApp, String keycloakId) {
        Usuario usuario = usuarioRepository.findByUsuarioApp(usuarioApp)
            .orElseThrow(() -> new IllegalArgumentException(
                "Usuario no encontrado: " + usuarioApp
            ));

        usuario.setKeycloakId(keycloakId);
        usuarioRepository.persist(usuario);
        
        return usuario;
    }

    /**
     * Busca un usuario por su keycloak_id
     * 
     * @param keycloakId ID de Keycloak
     * @return Usuario si existe
     */
    public Optional<Usuario> buscarPorKeycloakId(String keycloakId) {
        return usuarioRepository.findByKeycloakId(keycloakId);
    }
}
