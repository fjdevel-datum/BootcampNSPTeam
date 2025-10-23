package datum.travels.application.dto.evento;

import java.time.format.DateTimeFormatter;

/**
 * DTO para respuesta de evento
 * Contiene toda la información de un evento
 * 
 * @param idEvento - ID del evento
 * @param idEmpleado - ID del empleado dueño del evento
 * @param nombreEvento - Nombre del evento
 * @param fechaRegistro - Fecha de creación en formato dd/MM/yyyy (ej: 21/01/2025)
 * @param estado - Estado actual (activo, completado, cancelado)
 * @param nombreEmpleado - Nombre completo del empleado (para mostrar)
 */
public record EventoResponse(
    Long idEvento,
    Long idEmpleado,
    String nombreEvento,
    String fechaRegistro,
    String estado,
    String nombreEmpleado
) {
    
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    
    /**
     * Factory method para crear desde entidad Evento
     */
    public static EventoResponse from(datum.travels.domain.model.Evento evento) {
        return new EventoResponse(
            evento.getIdEvento(),
            evento.getIdEmpleado(),
            evento.getNombreEvento(),
            evento.getFechaRegistro() != null ? evento.getFechaRegistro().format(FORMATTER) : null,
            evento.getEstado(),
            evento.getEmpleado() != null ? evento.getEmpleado().getNombreCompleto() : "Sin asignar"
        );
    }
}
