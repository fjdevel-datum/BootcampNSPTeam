package datum.travels.application.dto.evento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para crear un nuevo evento
 * 
 * @param nombreEvento - Nombre descriptivo del evento
 * @param idEmpleado - ID del empleado que crea el evento
 */
public record CrearEventoRequest(
    
    @NotBlank(message = "El nombre del evento es obligatorio")
    String nombreEvento,
    
    @NotNull(message = "El ID del empleado es obligatorio")
    Long idEmpleado
    
) {
}
