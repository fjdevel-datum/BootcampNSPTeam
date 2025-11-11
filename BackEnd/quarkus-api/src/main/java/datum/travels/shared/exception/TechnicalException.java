package datum.travels.shared.exception;

/**
 * Excepción base para errores técnicos
 */
public class TechnicalException extends RuntimeException {
    
    public TechnicalException(String mensaje) {
        super(mensaje);
    }

    public TechnicalException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
