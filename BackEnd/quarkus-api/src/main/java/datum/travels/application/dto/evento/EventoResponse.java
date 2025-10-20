package datum.travels.application.dto.evento;

import java.time.LocalDate;

/**
 * DTO para respuesta de evento
 * Contiene toda la información de un evento
 * 
 * @param idEvento - ID del evento
 * @param idEmpleado - ID del empleado dueño del evento
 * @param nombreEvento - Nombre del evento
 * @param fechaRegistro - Fecha de creación
 * @param estado - Estado actual (activo, completado, cancelado)
 * @param nombreEmpleado - Nombre completo del empleado (para mostrar)
 */
public record EventoResponse(
    Long idEvento,
    Long idEmpleado,
    String nombreEvento,
    LocalDate fechaRegistro,
    String estado,
    String nombreEmpleado
) {
    
    /**
     * Factory method para crear desde entidad Evento
     */
    public static EventoResponse from(datum.travels.domain.model.Evento evento) {
        return new EventoResponse(
            evento.getIdEvento(),
            evento.getIdEmpleado(),
            evento.getNombreEvento(),
            evento.getFechaRegistro(),
            evento.getEstado(),
            evento.getEmpleado() != null ? evento.getEmpleado().getNombreCompleto() : "Sin asignar"
        );
    }
}
