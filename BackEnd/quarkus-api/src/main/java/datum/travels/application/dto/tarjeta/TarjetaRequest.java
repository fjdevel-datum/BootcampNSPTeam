package datum.travels.application.dto.tarjeta;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * DTO para crear una nueva tarjeta corporativa.
 */
public record TarjetaRequest(
    
    @NotBlank(message = "El banco es obligatorio")
    @Size(max = 100, message = "El banco no puede exceder 100 caracteres")
    String banco,
    
    @NotBlank(message = "El número de tarjeta es obligatorio")
    @Size(min = 15, max = 25, message = "El número de tarjeta debe tener entre 15 y 25 caracteres")
    @Pattern(regexp = "^[0-9\\s]+$", message = "El número de tarjeta solo puede contener números y espacios")
    String numeroTarjeta,
    
    @NotNull(message = "La fecha de expiración es obligatoria")
    LocalDate fechaExpiracion,
    
    @NotNull(message = "El país es obligatorio")
    Long idPais,
    
    // Opcional: puede asignarse después
    Long idEmpleado
) {
}
