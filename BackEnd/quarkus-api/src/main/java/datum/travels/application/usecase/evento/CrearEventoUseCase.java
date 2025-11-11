package datum.travels.application.usecase.evento;

import datum.travels.application.dto.evento.CrearEventoRequest;
import datum.travels.application.dto.evento.EventoResponse;
import datum.travels.domain.model.Evento;
import datum.travels.domain.repository.EventoRepository;
import datum.travels.shared.constant.AuthSimulation;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

/**
 * Caso de Uso: Crear un Nuevo Evento
 * 
 * Responsabilidades:
 * 1. Validar datos del evento
 * 2. Usar idEmpleado de simulación si no se proporciona
 * 3. Crear entidad Evento
 * 4. Persistir en base de datos
 * 5. Retornar evento creado
 */
@ApplicationScoped
public class CrearEventoUseCase {

    @Inject
    EventoRepository eventoRepository;

    /**
     * Crea un nuevo evento
     *
     * @param request Datos del evento a crear
     * @return EventoResponse con el evento creado
     */
    @Transactional
    public EventoResponse execute(CrearEventoRequest request) {
        
        // ⚠️ SIMULACIÓN: Si no se proporciona idEmpleado, usa el valor simulado
        Long idEmpleado = (request.idEmpleado() != null) 
            ? request.idEmpleado() 
            : AuthSimulation.ID_EMPLEADO_SIMULADO;
        
        // Crear entidad Evento
        Evento evento = new Evento(
                request.nombreEvento(),
                idEmpleado
        );

        // Persistir
        Evento eventoGuardado = eventoRepository.save(evento);

        // Retornar DTO
        return EventoResponse.from(eventoGuardado);
    }
}
