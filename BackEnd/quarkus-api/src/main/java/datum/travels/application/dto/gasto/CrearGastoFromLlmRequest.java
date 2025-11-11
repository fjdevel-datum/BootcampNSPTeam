package datum.travels.application.dto.gasto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO para recibir el JSON procesado por el LLM desde el frontend
 * 
 * Este DTO mapea la estructura que envía el frontend después de procesar
 * la imagen con OCR y el LLM.
 * 
 * Ejemplo de JSON recibido:
 * {
 *   "NombreEmpresa": "Restaurante El Portal, Guatemala City",
 *   "Descripcion": "Almuerzo con cliente - Reunion negocios",
 *   "MontoTotal": "390.00",
 *   "Moneda": "GTQ",
 *   "Fecha": "2025-11-03",
 *   "IdEvento": 15,
 *   "IdCategoria": 2,
 *   "IdTarjeta": 3
 * }
 */
public record CrearGastoFromLlmRequest(
    
    @NotNull(message = "El ID del evento es obligatorio")
    Long IdEvento,
    
    @NotNull(message = "El ID de la categoría es obligatorio")
    Long IdCategoria,
    
    // ID de la tarjeta (opcional - puede ser null para gastos en efectivo)
    Long IdTarjeta,
    
    @NotBlank(message = "El nombre de la empresa es obligatorio")
    String NombreEmpresa,
    
    @NotBlank(message = "La descripción es obligatoria")
    String Descripcion,
    
    @NotNull(message = "La fecha es obligatoria")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "La fecha debe estar en formato YYYY-MM-DD")
    String Fecha,
    
    @NotNull(message = "El monto es obligatorio")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "El monto debe ser un número decimal válido")
    String MontoTotal,

    @NotBlank(message = "El código de moneda es obligatorio")
    @Pattern(regexp = "^(USD|GTQ|HNL|PAB|EUR)$", 
             message = "Moneda no válida. Usar: USD, GTQ, HNL, PAB, EUR")
    String Moneda
) {
    
    /**
     * Convierte este DTO al formato que espera CrearGastoUseCase
     */
    public CrearGastoRequest toCrearGastoRequest() {
        // Parsear el monto como BigDecimal
        BigDecimal monto = new BigDecimal(MontoTotal);
        
        // Parsear la fecha como LocalDate
        LocalDate fecha = LocalDate.parse(Fecha);
        
        // Extraer solo el nombre de la empresa (sin ciudad)
        String lugar = NombreEmpresa;
        if (lugar.contains(",")) {
            lugar = lugar.substring(0, lugar.indexOf(",")).trim();
        }
        
        // Limitar descripción a 50 caracteres (regla de negocio)
        String descripcionFinal = Descripcion;
        if (descripcionFinal.length() > 50) {
            descripcionFinal = descripcionFinal.substring(0, 47) + "...";
        }
        
        return new CrearGastoRequest(
            IdEvento,
            IdCategoria,
            IdTarjeta,
            descripcionFinal,
            lugar,
            fecha,
            monto,
            Moneda
        );
    }
}
