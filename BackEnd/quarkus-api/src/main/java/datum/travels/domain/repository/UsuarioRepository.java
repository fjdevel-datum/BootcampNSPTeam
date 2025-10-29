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

    /**
     * Busca un usuario por su Keycloak ID
     *
     * @param keycloakId ID generado por Keycloak
     * @return Optional con el usuario si existe
     */
    Optional<Usuario> findByKeycloakId(String keycloakId);

    /**
     * Persiste o actualiza un usuario
     *
     * @param usuario Usuario a persistir
     */
    void persist(Usuario usuario);
}
