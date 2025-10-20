package datum.travels.application.dto.auth;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO para solicitud de login
 * 
 * @param usuarioApp - Nombre de usuario (campo usuario_app en BD)
 * @param contrasena - Contraseña sin hashear
 */
public record LoginRequest(
    
    @NotBlank(message = "El usuario es obligatorio")
    String usuarioApp,
    
    @NotBlank(message = "La contraseña es obligatoria")
    String contrasena
    
) {
}
