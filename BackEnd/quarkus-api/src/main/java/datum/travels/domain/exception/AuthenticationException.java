package datum.travels.domain.exception;

/**
 * Excepción de dominio para errores de autenticación
 * Se lanza cuando las credenciales son inválidas o el token no es válido
 */
public class AuthenticationException extends RuntimeException {

    public AuthenticationException(String message) {
        super(message);
    }

    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
