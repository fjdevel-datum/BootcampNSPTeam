package datum.travels.application.usecase.empleado;

import datum.travels.application.dto.empleado.CambiarContrasenaRequest;
import datum.travels.domain.model.Usuario;
import datum.travels.domain.repository.UsuarioRepository;
import datum.travels.infrastructure.adapter.external.KeycloakAdminClient;
import datum.travels.shared.exception.BusinessException;
import datum.travels.domain.exception.ResourceNotFoundException;
import datum.travels.shared.util.CurrentUserProvider;
import datum.travels.shared.security.PasswordHasher;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

/**
 * Caso de Uso: Cambiar Contraseña del Usuario Autenticado
 * 
 * Responsabilidades:
 * 1. Validar que las contraseñas coincidan
 * 2. Verificar la contraseña actual
 * 3. Actualizar contraseña en Keycloak
 * 4. Actualizar contraseña en BD (hash)
 */
@ApplicationScoped
public class CambiarContrasenaUseCase {

    @Inject
    CurrentUserProvider currentUserProvider;

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    KeycloakAdminClient keycloakAdminClient;

    @Inject
    PasswordHasher passwordHasher;

    /**
     * Ejecuta el caso de uso para cambiar la contraseña
     *
     * @param request datos de la solicitud
     * @throws ResourceNotFoundException si no se encuentra el usuario
     * @throws BusinessException si las validaciones fallan
     */
    @Transactional
    public void execute(CambiarContrasenaRequest request) {
        // Validar que la nueva contraseña y su confirmación coincidan
        if (!request.getContrasenaNueva().equals(request.getConfirmacionContrasena())) {
            throw new BusinessException("La nueva contraseña y su confirmación no coinciden");
        }

        // Obtener usuario autenticado
        Usuario usuario = currentUserProvider.getUsuario()
            .orElseThrow(() -> new ResourceNotFoundException(
                "No se encontró un usuario asociado a la sesión actual"
            ));

        // Verificar contraseña actual autenticando contra Keycloak
        // (Keycloak es la fuente de verdad para autenticación)
        boolean isValidPassword = keycloakAdminClient.verifyUserPassword(
            usuario.getUsuarioApp(), 
            request.getContrasenaActual()
        );
        
        if (!isValidPassword) {
            throw new BusinessException("La contraseña actual es incorrecta");
        }

        // Actualizar contraseña en Keycloak
        try {
            keycloakAdminClient.changePassword(usuario.getKeycloakId(), request.getContrasenaNueva());
        } catch (Exception e) {
            throw new BusinessException("Error al actualizar la contraseña en Keycloak: " + e.getMessage());
        }

        // Actualizar contraseña en BD (hash) para mantener sincronización
        String hashedPassword = passwordHasher.hash(request.getContrasenaNueva());
        usuario.setContrasena(hashedPassword);
        usuarioRepository.persist(usuario);
    }
}
