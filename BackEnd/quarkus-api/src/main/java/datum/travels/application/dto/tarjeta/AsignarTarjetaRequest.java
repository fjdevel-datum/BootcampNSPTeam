package datum.travels.application.dto.tarjeta;

import jakarta.validation.constraints.NotNull;

/**
 * DTO para asignar una tarjeta a un empleado.
 */
public record AsignarTarjetaRequest(
    
    @NotNull(message = "El ID de la tarjeta es obligatorio")
    Long idTarjeta,
    
    @NotNull(message = "El ID del empleado es obligatorio")
    Long idEmpleado
) {
}
