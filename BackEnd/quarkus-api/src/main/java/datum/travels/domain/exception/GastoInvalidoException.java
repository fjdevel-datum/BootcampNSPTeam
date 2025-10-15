package datum.travels.domain.exception;

/**
 * Excepción cuando un gasto es inválido según reglas de negocio
 */
public class GastoInvalidoException extends RuntimeException {
    
    public GastoInvalidoException(String mensaje) {
        super(mensaje);
    }

    public GastoInvalidoException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
