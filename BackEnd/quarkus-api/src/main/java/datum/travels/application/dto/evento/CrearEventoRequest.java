package datum.travels.application.dto.evento;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO para crear un nuevo evento
 * 
 * @param nombreEvento - Nombre descriptivo del evento
 * @param idEmpleado - ID del empleado que crea el evento (opcional, usa simulación si es null)
 */
public record CrearEventoRequest(
    
    @NotBlank(message = "El nombre del evento es obligatorio")
    String nombreEvento,
    
    // ⚠️ TEMPORAL: idEmpleado es opcional mientras no existe login
    // Si es null, se usa AuthSimulation.ID_EMPLEADO_SIMULADO
    Long idEmpleado
    
) {
}
