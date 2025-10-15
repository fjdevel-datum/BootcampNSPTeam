package datum.travels.application.usecase.auth;

/**
 * Caso de uso: Validar sesión activa
 */
public interface ValidarSesionUseCase {
    
    /**
     * Valida si una sesión está activa
     * @param token Token de sesión
     * @return true si la sesión es válida
     */
    boolean validar(String token);
    
    /**
     * Obtiene información del usuario desde el token
     * @param token Token de sesión
     * @return ID del usuario
     */
    Long obtenerUsuarioDesdeToken(String token);
}
