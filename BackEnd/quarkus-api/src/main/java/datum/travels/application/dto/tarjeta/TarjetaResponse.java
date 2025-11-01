package datum.travels.application.dto.tarjeta;

import java.time.LocalDate;

/**
 * DTO de respuesta con datos de una tarjeta.
 */
public record TarjetaResponse(
    Long idTarjeta,
    String banco,
    String numeroTarjeta,
    LocalDate fechaExpiracion,
    Long idPais,
    String nombrePais,
    EmpleadoTarjetaDTO empleado
) {
    
    public record EmpleadoTarjetaDTO(
        Long idEmpleado,
        String nombre,
        String apellido,
        String correo
    ) {
        public String nombreCompleto() {
            return nombre + " " + apellido;
        }
    }
}
