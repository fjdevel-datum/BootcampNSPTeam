package datum.travels.domain.exception;

/**
 * Excepción lanzada cuando no se encuentra un recurso
 */
public class EventoNotFoundException extends DomainException {

    public EventoNotFoundException(Long id) {
        super("Evento no encontrado con ID: " + id);
    }

    public EventoNotFoundException(String message) {
        super(message);
    }
}
