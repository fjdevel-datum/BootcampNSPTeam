package datum.travels.domain.exception;

/**
 * Excepción cuando no se encuentra un evento
 */
public class EventoNoEncontradoException extends RuntimeException {
    
    public EventoNoEncontradoException(Long id) {
        super("Evento no encontrado con ID: " + id);
    }

    public EventoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
