package datum.travels.service;

import datum.travels.dto.evento.CrearEventoDTO;
import datum.travels.dto.evento.EventoResumenDTO;
import datum.travels.dto.evento.EventoResponseDTO;
import datum.travels.entity.Evento;
import datum.travels.mapper.EventoMapper;
import datum.travels.repository.EventoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

/**
 * Service para lógica de negocio de Eventos
 */
@ApplicationScoped
public class EventoService {

    @Inject
    EventoRepository eventoRepository;

    @Inject
    EventoMapper eventoMapper;

    /**
     * Obtiene todos los eventos de un empleado
     * @param idEmpleado ID del empleado
     * @return Lista de eventos resumidos
     */
    public List<EventoResumenDTO> getEventosByEmpleado(Long idEmpleado) {
        List<Evento> eventos = eventoRepository.findByEmpleado(idEmpleado);
        return eventoMapper.toResumenDTOList(eventos);
    }

    /**
     * Obtiene solo los eventos activos de un empleado
     * @param idEmpleado ID del empleado
     * @return Lista de eventos activos
     */
    public List<EventoResumenDTO> getEventosActivosByEmpleado(Long idEmpleado) {
        List<Evento> eventos = eventoRepository.findEventosActivosByEmpleado(idEmpleado);
        return eventoMapper.toResumenDTOList(eventos);
    }

    /**
     * Crea un nuevo evento
     * @param dto Datos del evento a crear
     * @return Respuesta con el evento creado
     */
    @Transactional
    public EventoResponseDTO crearEvento(CrearEventoDTO dto) {
        try {
            // Convertir DTO a Entity
            Evento evento = eventoMapper.toEntity(dto);

            // Persistir en la BD
            eventoRepository.persist(evento);

            // Retornar respuesta exitosa
            return eventoMapper.toResponseDTO(evento);

        } catch (Exception e) {
            // Retornar respuesta de error
            return EventoResponseDTO.error("Error al crear el evento: " + e.getMessage());
        }
    }

    /**
     * Obtiene un evento por su ID
     * @param idEvento ID del evento
     * @return Evento encontrado o null
     */
    public EventoResumenDTO getEventoById(Long idEvento) {
        Evento evento = eventoRepository.findById(idEvento);
        return eventoMapper.toResumenDTO(evento);
    }

    /**
     * Cambia el estado de un evento
     * @param idEvento ID del evento
     * @param nuevoEstado Nuevo estado (activo, completado, pendiente)
     * @return true si se actualizó correctamente
     */
    @Transactional
    public boolean cambiarEstadoEvento(Long idEvento, String nuevoEstado) {
        Evento evento = eventoRepository.findById(idEvento);
        if (evento != null) {
            evento.setEstado(nuevoEstado);
            eventoRepository.persist(evento);
            return true;
        }
        return false;
    }
}