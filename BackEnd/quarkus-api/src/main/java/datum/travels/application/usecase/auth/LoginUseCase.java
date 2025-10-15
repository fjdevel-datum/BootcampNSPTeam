package datum.travels.application.usecase.auth;

/**
 * Caso de uso: Iniciar sesión
 */
public interface LoginUseCase {
    
    /**
     * Autentica un usuario
     * @param username Nombre de usuario
     * @param password Contraseña
     * @return Token de autenticación
     */
    String autenticar(String username, String password);
}
