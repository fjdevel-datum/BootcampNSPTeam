package datum.travels.mapper;

import datum.travels.dto.evento.CrearEventoDTO;
import datum.travels.dto.evento.EventoResumenDTO;
import datum.travels.dto.evento.EventoResponseDTO;
import datum.travels.entity.Evento;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper para convertir entre Entity Evento y sus DTOs
 */
@ApplicationScoped
public class EventoMapper {

    /**
     * Convierte una entidad Evento a EventoResumenDTO (para lista en HOME)
     */
    public EventoResumenDTO toResumenDTO(Evento evento) {
        if (evento == null) {
            return null;
        }

        return new EventoResumenDTO(
                evento.getIdEvento(),
                evento.getNombreEvento(),
                evento.getFechaRegistro(),
                evento.getEstado()
        );
    }

    /**
     * Convierte una lista de entidades a lista de DTOs
     */
    public List<EventoResumenDTO> toResumenDTOList(List<Evento> eventos) {
        return eventos.stream()
                .map(this::toResumenDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convierte un CrearEventoDTO a una entidad Evento
     */
    public Evento toEntity(CrearEventoDTO dto) {
        if (dto == null) {
            return null;
        }

        Evento evento = new Evento();
        evento.setIdEmpleado(dto.getIdEmpleado());
        evento.setNombreEvento(dto.getNombreEvento());
        evento.setFechaRegistro(LocalDate.now());
        evento.setEstado("activo"); // Estado por defecto

        return evento;
    }

    /**
     * Convierte una entidad Evento a EventoResponseDTO (respuesta al crear)
     */
    public EventoResponseDTO toResponseDTO(Evento evento) {
        if (evento == null) {
            return null;
        }

        return EventoResponseDTO.success(
                evento.getIdEvento(),
                evento.getNombreEvento(),
                evento.getFechaRegistro(),
                evento.getEstado()
        );
    }
}