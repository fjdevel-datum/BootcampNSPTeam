package datum.travels.application.usecase.evento;

import datum.travels.application.dto.evento.EventoResponse;
import datum.travels.domain.repository.EventoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Caso de Uso: Listar Eventos de un Empleado
 * 
 * Responsabilidades:
 * 1. Obtener todos los eventos del empleado
 * 2. Convertir a DTOs de respuesta
 */
@ApplicationScoped
public class ListarEventosUseCase {

    @Inject
    EventoRepository eventoRepository;

    /**
     * Lista todos los eventos de un empleado
     *
     * @param idEmpleado ID del empleado
     * @return Lista de EventoResponse
     */
    public List<EventoResponse> execute(Long idEmpleado) {
        return eventoRepository.findByIdEmpleado(idEmpleado)
                .stream()
                .map(EventoResponse::from)
                .collect(Collectors.toList());
    }
}
