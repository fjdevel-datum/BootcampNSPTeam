package datum.travels.application.dto.reporte;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * DTO para solicitud de envío de reporte de gastos
 * 
 * @param emailDestino - Email al que se enviará el reporte
 * @param codigoPais - Código del país (SV, GT, HN, PA, CR)
 * @param nombreProveedor - Nombre del proveedor para el asunto
 * @param formato - Formato del reporte: "PDF" o "EXCEL"
 */
public record EnviarReporteRequest(
    
    @NotBlank(message = "El email de destino es obligatorio")
    @Email(message = "El email debe ser válido")
    String emailDestino,
    
    @NotBlank(message = "El código de país es obligatorio")
    @Pattern(regexp = "SV|GT|HN|PA|CR", 
             message = "El código de país debe ser: SV, GT, HN, PA o CR")
    String codigoPais,
    
    String nombreProveedor, // Opcional, se puede inferir del evento
    
    @NotBlank(message = "El formato es obligatorio")
    @Pattern(regexp = "PDF|EXCEL", 
             message = "El formato debe ser: PDF o EXCEL")
    String formato
    
) {
    /**
     * Genera el asunto del correo según el formato especificado
     * Ejemplo: "GT-SUBWAY DE GUATEMALA"
     */
    public String generarAsunto() {
        String proveedor = nombreProveedor != null && !nombreProveedor.isBlank() 
            ? nombreProveedor 
            : "PROVEEDOR";
        return codigoPais.toUpperCase() + "-" + proveedor.toUpperCase();
    }
}
