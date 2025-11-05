package datum.travels.application.dto.empleado;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO para cambiar la contraseña del usuario autenticado
 */
public class CambiarContrasenaRequest {

    @NotBlank(message = "La contraseña actual es obligatoria")
    private String contrasenaActual;

    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Size(min = 5, message = "La contraseña debe tener al menos 5 caracteres")
    private String contrasenaNueva;

    @NotBlank(message = "La confirmación de contraseña es obligatoria")
    private String confirmacionContrasena;

    // Constructors
    public CambiarContrasenaRequest() {
    }

    public CambiarContrasenaRequest(String contrasenaActual, String contrasenaNueva, String confirmacionContrasena) {
        this.contrasenaActual = contrasenaActual;
        this.contrasenaNueva = contrasenaNueva;
        this.confirmacionContrasena = confirmacionContrasena;
    }

    // Getters and Setters
    public String getContrasenaActual() {
        return contrasenaActual;
    }

    public void setContrasenaActual(String contrasenaActual) {
        this.contrasenaActual = contrasenaActual;
    }

    public String getContrasenaNueva() {
        return contrasenaNueva;
    }

    public void setContrasenaNueva(String contrasenaNueva) {
        this.contrasenaNueva = contrasenaNueva;
    }

    public String getConfirmacionContrasena() {
        return confirmacionContrasena;
    }

    public void setConfirmacionContrasena(String confirmacionContrasena) {
        this.confirmacionContrasena = confirmacionContrasena;
    }
}
