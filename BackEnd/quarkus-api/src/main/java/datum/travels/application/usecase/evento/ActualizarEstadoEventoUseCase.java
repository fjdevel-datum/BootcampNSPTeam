package datum.travels.application.usecase.evento;

import datum.travels.application.dto.evento.ActualizarEstadoRequest;
import datum.travels.application.dto.evento.EventoResponse;
import datum.travels.domain.exception.ResourceNotFoundException;
import datum.travels.domain.model.Evento;
import datum.travels.domain.repository.EventoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

/**
 * Caso de Uso: Actualizar Estado de un Evento
 * 
 * Responsabilidades:
 * 1. Buscar evento por ID
 * 2. Validar que existe
 * 3. Actualizar el estado
 * 4. Persistir cambios
 */
@ApplicationScoped
public class ActualizarEstadoEventoUseCase {

    @Inject
    EventoRepository eventoRepository;

    /**
     * Actualiza el estado de un evento
     *
     * @param idEvento ID del evento a actualizar
     * @param request Nuevo estado
     * @return EventoResponse con el evento actualizado
     * @throws ResourceNotFoundException si el evento no existe
     */
    @Transactional
    public EventoResponse execute(Long idEvento, ActualizarEstadoRequest request) {
        
        // Buscar evento
        Evento evento = eventoRepository.findByIdEvento(idEvento)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Evento no encontrado con ID: " + idEvento
                ));

        // Actualizar estado
        evento.setEstado(request.estado());

        // Persistir cambios
        Evento eventoActualizado = eventoRepository.update(evento);

        return EventoResponse.from(eventoActualizado);
    }
}
