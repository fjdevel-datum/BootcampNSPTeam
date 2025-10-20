package datum.travels.application.dto.auth;

/**
 * DTO para respuesta exitosa de login
 * 
 * @param token - JWT firmado
 * @param type - Tipo de token (siempre "Bearer")
 * @param expiresIn - Tiempo de expiración en segundos
 * @param usuario - Información del usuario logueado
 */
public record LoginResponse(
    String token,
    String type,
    Long expiresIn,
    UsuarioInfo usuario
) {
    
    /**
     * Constructor helper para crear respuesta con tipo Bearer por defecto
     */
    public static LoginResponse of(String token, Long expiresIn, UsuarioInfo usuario) {
        return new LoginResponse(token, "Bearer", expiresIn, usuario);
    }
    
    /**
     * Información del usuario logueado (nested record)
     */
    public record UsuarioInfo(
        Long idUsuario,
        Long idEmpleado,
        String usuarioApp,
        String nombreCompleto,
        String correo
    ) {
    }
}
