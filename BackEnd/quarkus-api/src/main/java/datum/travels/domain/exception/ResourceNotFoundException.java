package datum.travels.domain.exception;

/**
 * Excepción de dominio para cuando un recurso no es encontrado
 * Se lanza cuando se busca una entidad por ID y no existe
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
