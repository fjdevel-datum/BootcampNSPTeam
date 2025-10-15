package datum.travels.application.usecase.evento;

import datum.travels.domain.exception.BusinessValidationException;
import datum.travels.domain.exception.EventoNoEncontradoException;
import datum.travels.domain.model.Evento;
import datum.travels.domain.repository.EventoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

/**
 * Implementación de los casos de uso para gestión de eventos
 * Orquesta la lógica de negocio y coordina con el repositorio
 */
@ApplicationScoped
public class EventoUseCaseImpl implements CrearEventoUseCase {

    @Inject
    EventoRepository eventoRepository;

    // ========================
    // CASO DE USO: Crear Evento
    // ========================
    @Override
    @Transactional
    public Evento ejecutar(Evento evento) {
        // Validaciones de negocio
        if (evento.getNombreEvento() == null || evento.getNombreEvento().trim().isEmpty()) {
            throw new BusinessValidationException("El nombre del evento es obligatorio");
        }

        if (evento.getIdEmpleado() == null) {
            throw new BusinessValidationException("El ID del empleado es obligatorio");
        }

        // Guardar el evento
        return eventoRepository.guardar(evento);
    }

    // ========================
    // MÉTODOS ADICIONALES DE APOYO
    // ========================
    
    public List<Evento> listarEventosActivos() {
        return eventoRepository.listarEventosActivos();
    }

    // ========================
    // MÉTODOS ADICIONALES DE APOYO
    // ========================
    
    public List<Evento> obtenerEventosPorEmpleado(Long empleadoId) {
        if (empleadoId == null) {
            throw new BusinessValidationException("El ID del empleado es obligatorio");
        }

        return eventoRepository.listarPorEmpleado(empleadoId);
    }

    public Evento obtenerEventoPorId(Long eventoId) {
        if (eventoId == null) {
            throw new BusinessValidationException("El ID del evento es obligatorio");
        }

        return eventoRepository.buscarPorId(eventoId)
                .orElseThrow(() -> new EventoNoEncontradoException(eventoId));
    }

    @Transactional
    public Evento cambiarEstadoEvento(Long eventoId, String nuevoEstado) {
        Evento evento = obtenerEventoPorId(eventoId);
        evento.setEstado(nuevoEstado);
        return eventoRepository.guardar(evento);
    }

    @Transactional
    public Evento completarEvento(Long eventoId) {
        Evento evento = obtenerEventoPorId(eventoId);
        evento.setEstado("completado");
        return eventoRepository.guardar(evento);
    }

    @Transactional
    public Evento cancelarEvento(Long eventoId) {
        Evento evento = obtenerEventoPorId(eventoId);
        evento.setEstado("cancelado");
        return eventoRepository.guardar(evento);
    }
}
