package datum.travels.application.dto.evento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para crear un nuevo evento desde el modal en el HOME
 * Solo requiere el nombre del evento, el resto se asigna automáticamente
 */
public class CrearEventoDTO {

    @NotBlank(message = "El nombre del evento es requerido")
    private String nombreEvento;

    @NotNull(message = "El ID del empleado es requerido")
    private Long idEmpleado;

    // Constructors
    public CrearEventoDTO() {
    }

    public CrearEventoDTO(String nombreEvento, Long idEmpleado) {
        this.nombreEvento = nombreEvento;
        this.idEmpleado = idEmpleado;
    }

    // Getters and Setters
    public String getNombreEvento() {
        return nombreEvento;
    }

    public void setNombreEvento(String nombreEvento) {
        this.nombreEvento = nombreEvento;
    }

    public Long getIdEmpleado() {
        return idEmpleado;
    }

    public void setIdEmpleado(Long idEmpleado) {
        this.idEmpleado = idEmpleado;
    }
}