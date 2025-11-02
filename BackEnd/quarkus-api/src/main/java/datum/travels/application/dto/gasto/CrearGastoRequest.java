package datum.travels.application.dto.gasto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO para registrar un nuevo gasto
 * Se usa después de procesar el comprobante con OCR
 * 
 * @param idEvento - ID del evento al que pertenece el gasto
 * @param idCategoria - ID de la categoría del gasto (Transporte, Alimentación, etc.)
 * @param idTarjeta - ID de la tarjeta corporativa (puede ser null si es efectivo)
 * @param descripcion - Descripción del gasto
 * @param lugar - Lugar donde se realizó el gasto
 * @param fecha - Fecha del gasto
 * @param monto - Monto del gasto
 */
public record CrearGastoRequest(
    
    @NotNull(message = "El ID del evento es obligatorio")
    Long idEvento,
    
    @NotNull(message = "El ID de la categoría es obligatorio")
    Long idCategoria,
    
    // idTarjeta es opcional (puede ser null para gastos en efectivo)
    Long idTarjeta,
    
    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 50, message = "La descripción no puede exceder 50 caracteres")
    String descripcion,
    
    @NotBlank(message = "El lugar es obligatorio")
    @Size(max = 100, message = "El lugar no puede exceder 100 caracteres")
    String lugar,
    
    @NotNull(message = "La fecha es obligatoria")
    LocalDate fecha,
    
    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    BigDecimal monto
) {
}
