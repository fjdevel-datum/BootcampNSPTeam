package datum.travels.domain.repository;

import datum.travels.domain.model.Usuario;

import java.util.Optional;

/**
 * Puerto de repositorio para Usuario (Clean Architecture)
 * La implementación estará en infrastructure/persistence
 */
public interface UsuarioRepository {

    /**
     * Busca un usuario por su nombre de usuario
     *
     * @param usuarioApp Nombre de usuario
     * @return Optional con el usuario si existe
     */
    Optional<Usuario> findByUsuarioApp(String usuarioApp);

    /**
     * Busca un usuario por su ID
     *
     * @param idUsuario ID del usuario
     * @return Optional con el usuario si existe
     */
    Optional<Usuario> findByIdUsuario(Long idUsuario);
}
