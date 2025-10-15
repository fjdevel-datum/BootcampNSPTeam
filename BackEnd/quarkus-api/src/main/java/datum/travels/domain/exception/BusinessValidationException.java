package datum.travels.domain.exception;

/**
 * Excepción lanzada cuando hay un error de validación de negocio
 */
public class BusinessValidationException extends DomainException {

    public BusinessValidationException(String message) {
        super(message);
    }

    public BusinessValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
