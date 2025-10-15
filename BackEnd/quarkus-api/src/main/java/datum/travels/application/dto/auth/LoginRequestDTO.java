package datum.travels.application.dto.auth;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO para recibir las credenciales de login desde el frontend
 */

public class LoginRequestDTO {

    @NotBlank(message = "El usuario es requerido")
    private String usuarioApp;

    @NotBlank(message = "La contraseña es requerida")
    private String contrasena;

    // Constructors
    public LoginRequestDTO() {
    }

    public LoginRequestDTO(String usuarioApp, String contrasena) {
        this.usuarioApp = usuarioApp;
        this.contrasena = contrasena;
    }

    // Getters and Setters
    public String getUsuarioApp() {
        return usuarioApp;
    }

    public void setUsuarioApp(String usuarioApp) {
        this.usuarioApp = usuarioApp;
    }

    public String getContrasena() {
        return contrasena;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }
}