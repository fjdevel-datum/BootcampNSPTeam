package datum.travels.application.dto.empleado;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Payload para crear un nuevo empleado con usuario asociado.
 */
public record CrearEmpleadoRequest(

    @NotNull(message = "El departamento es requerido")
    Long idDepartamento,

    @NotNull(message = "El cargo es requerido")
    Long idCargo,

    @NotNull(message = "La empresa es requerida")
    Long idEmpresa,

    @NotBlank(message = "El nombre es obligatorio")
    String nombre,

    @NotBlank(message = "El apellido es obligatorio")
    String apellido,

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no tiene un formato válido")
    String correo,

    String telefono,

    @NotBlank(message = "El nombre de usuario es obligatorio")
    String usuario,

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 5, message = "La contraseña debe tener al menos 5 caracteres")
    String contrasena
) {
}
