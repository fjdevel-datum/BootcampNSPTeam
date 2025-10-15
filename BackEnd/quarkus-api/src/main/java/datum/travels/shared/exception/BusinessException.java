package datum.travels.shared.exception;

/**
 * Excepción base para errores de negocio
 */
public class BusinessException extends RuntimeException {
    
    public BusinessException(String mensaje) {
        super(mensaje);
    }

    public BusinessException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
