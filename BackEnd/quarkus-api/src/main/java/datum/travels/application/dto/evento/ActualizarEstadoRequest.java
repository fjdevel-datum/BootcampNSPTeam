package datum.travels.application.dto.evento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * DTO para actualizar el estado de un evento
 * 
 * @param estado - Nuevo estado (activo, completado, cancelado)
 */
public record ActualizarEstadoRequest(
    
    @NotBlank(message = "El estado es obligatorio")
    @Pattern(regexp = "activo|completado|cancelado", 
             message = "El estado debe ser: activo, completado o cancelado")
    String estado
    
) {
}
