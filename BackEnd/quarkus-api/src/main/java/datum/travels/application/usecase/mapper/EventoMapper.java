package datum.travels.application.usecase.mapper;

import datum.travels.application.dto.evento.CrearEventoDTO;
import datum.travels.application.dto.evento.EventoDetalleDTO;
import datum.travels.application.dto.evento.EventoResponseDTO;
import datum.travels.application.dto.evento.EventoResumenDTO;
import datum.travels.domain.model.Evento;
import datum.travels.domain.model.Gasto;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper para convertir entre Evento (entidad de dominio) y sus DTOs
 * Implementa las conversiones necesarias para la capa de aplicación
 */
@ApplicationScoped
public class EventoMapper {

    /**
     * Convierte una entidad Evento a EventoDetalleDTO (para pantalla de detalle)
     * Incluye información del empleado y sus gastos
     * 
     * @param evento Entidad de dominio
     * @return DTO con información completa del evento
     */
    public EventoDetalleDTO toDetalleDTO(Evento evento) {
        if (evento == null) {
            return null;
        }

        EventoDetalleDTO dto = new EventoDetalleDTO();
        dto.setId(evento.getIdEvento());
        dto.setNombreEvento(evento.getNombreEvento());
        dto.setFechaRegistro(evento.getFechaRegistro());
        dto.setEstado(evento.getEstado());

        // Mapear información del empleado si existe
        if (evento.getEmpleado() != null) {
            dto.setIdEmpleado(evento.getEmpleado().getIdEmpleado());
            dto.setNombreEmpleado(evento.getEmpleado().getNombreCompleto());
            
            if (evento.getEmpleado().getCargo() != null) {
                dto.setCargoEmpleado(evento.getEmpleado().getCargo().nombre);
            }
            
            if (evento.getEmpleado().getDepartamento() != null) {
                dto.setDepartamentoEmpleado(evento.getEmpleado().getDepartamento().nombreDepart);
            }
        }

        // Mapear gastos asociados (Evento no tiene relación con Gasto en este momento)
        // Se implementará cuando se agregue la relación @OneToMany en Evento
        dto.setGastos(Collections.emptyList());
        dto.setTotalGastos(0);

        return dto;
    }

    /**
     * Convierte una entidad Evento a EventoResumenDTO (para listados)
     * Solo incluye información básica del evento
     * 
     * @param evento Entidad de dominio
     * @return DTO con información resumida
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
     * Convierte una entidad Evento a EventoResponseDTO (respuesta de creación)
     * 
     * @param evento Entidad recién creada
     * @return DTO de respuesta con mensaje de éxito
     */
    public EventoResponseDTO toResponseDTO(Evento evento) {
        if (evento == null) {
            return EventoResponseDTO.error("No se pudo crear el evento");
        }

        return EventoResponseDTO.success(
            evento.getIdEvento(),
            evento.getNombreEvento(),
            evento.getFechaRegistro(),
            evento.getEstado()
        );
    }

    /**
     * Convierte CrearEventoDTO a entidad Evento
     * Inicializa los campos automáticos (fecha actual, estado activo)
     * 
     * @param dto DTO con datos de creación
     * @return Entidad Evento lista para persistir
     */
    public Evento fromCrearDTO(CrearEventoDTO dto) {
        if (dto == null) {
            return null;
        }

        Evento evento = new Evento();
        evento.setIdEmpleado(dto.getIdEmpleado());
        evento.setNombreEvento(dto.getNombreEvento());
        evento.setFechaRegistro(LocalDate.now());
        evento.setEstado("activo");

        return evento;
    }

    /**
     * Convierte una lista de Eventos a lista de EventoResumenDTO
     * 
     * @param eventos Lista de entidades
     * @return Lista de DTOs resumidos
     */
    public List<EventoResumenDTO> toResumenDTOList(List<Evento> eventos) {
        if (eventos == null || eventos.isEmpty()) {
            return Collections.emptyList();
        }

        return eventos.stream()
            .map(this::toResumenDTO)
            .collect(Collectors.toList());
    }

    /**
     * Convierte un Gasto a GastoResumenDTO (inner DTO de EventoDetalleDTO)
     * 
     * @param gasto Entidad de gasto
     * @return DTO resumido del gasto
     */
    private EventoDetalleDTO.GastoResumenDTO toGastoResumenDTO(Gasto gasto) {
        if (gasto == null) {
            return null;
        }

        EventoDetalleDTO.GastoResumenDTO dto = new EventoDetalleDTO.GastoResumenDTO();
        dto.setId(gasto.idGasto);
        dto.setConcepto(gasto.descripcion); // Gasto usa "descripcion" no "concepto"
        dto.setTipoGasto(gasto.categoria != null ? gasto.categoria.nombreCategoria : "Sin categoría");
        dto.setMonto(gasto.monto != null ? gasto.monto.doubleValue() : 0.0);
        dto.setFechaGasto(gasto.fecha); // Gasto usa "fecha" no "fechaGasto"

        return dto;
    }
}
