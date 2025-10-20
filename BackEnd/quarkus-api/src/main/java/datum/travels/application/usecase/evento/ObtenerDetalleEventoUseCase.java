package datum.travels.application.usecase.evento;

import datum.travels.application.dto.evento.EventoResponse;
import datum.travels.domain.exception.ResourceNotFoundException;
import datum.travels.domain.model.Evento;
import datum.travels.domain.repository.EventoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Caso de Uso: Obtener Detalle de un Evento
 * 
 * Responsabilidades:
 * 1. Buscar evento por ID
 * 2. Lanzar excepción si no existe
 * 3. Retornar detalles completos
 */
@ApplicationScoped
public class ObtenerDetalleEventoUseCase {

    @Inject
    EventoRepository eventoRepository;

    /**
     * Obtiene los detalles de un evento por su ID
     *
     * @param idEvento ID del evento
     * @return EventoResponse con los detalles
     * @throws ResourceNotFoundException si el evento no existe
     */
    public EventoResponse execute(Long idEvento) {
        Evento evento = eventoRepository.findByIdEvento(idEvento)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Evento no encontrado con ID: " + idEvento
                ));

        return EventoResponse.from(evento);
    }
}
