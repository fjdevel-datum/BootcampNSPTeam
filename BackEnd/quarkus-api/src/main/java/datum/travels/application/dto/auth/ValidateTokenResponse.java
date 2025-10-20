package datum.travels.application.dto.auth;

/**
 * DTO para respuesta de validación de token
 * 
 * @param valid - Si el token es válido
 * @param idUsuario - ID del usuario si el token es válido
 * @param usuarioApp - Nombre de usuario si el token es válido
 * @param message - Mensaje descriptivo (ej: "Token válido", "Token expirado")
 */
public record ValidateTokenResponse(
    boolean valid,
    Long idUsuario,
    String usuarioApp,
    String message
) {
    
    /**
     * Factory method para token válido
     */
    public static ValidateTokenResponse valid(Long idUsuario, String usuarioApp) {
        return new ValidateTokenResponse(true, idUsuario, usuarioApp, "Token válido");
    }
    
    /**
     * Factory method para token inválido
     */
    public static ValidateTokenResponse invalid(String reason) {
        return new ValidateTokenResponse(false, null, null, reason);
    }
}
