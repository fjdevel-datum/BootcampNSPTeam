package datum.travels.application.dto.gasto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO utilizado para actualizar un gasto existente.
 * Todos los campos son opcionales; si un campo viene en el payload se actualiza,
 * de lo contrario se mantiene el valor actual.
 */
@JsonInclude(Include.NON_NULL)
public record ActualizarGastoRequest(
        @Size(max = 50, message = "La descripcion no puede exceder 50 caracteres")
        String descripcion,

        @Size(max = 100, message = "El lugar no puede exceder 100 caracteres")
        String lugar,

        LocalDate fecha,

        @Positive(message = "El monto debe ser mayor a cero")
        BigDecimal monto,

        @Size(max = 3, message = "La moneda debe ser un codigo ISO 4217 de 3 caracteres")
        String moneda,

        Long idCategoria,

        Long idTarjeta,

        Boolean sinTarjeta
) {}

