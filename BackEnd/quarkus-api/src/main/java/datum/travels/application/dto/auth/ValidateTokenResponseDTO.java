package datum.travels.application.dto.auth;

/**
 * DTO para respuesta de validación de token
 */
public class ValidateTokenResponseDTO {

    private boolean valid;
    private Long idEmpleado;
    private String usuarioApp;
    private String mensaje;

    // Constructores
    public ValidateTokenResponseDTO() {
    }

    public ValidateTokenResponseDTO(boolean valid, Long idEmpleado, String usuarioApp, String mensaje) {
        this.valid = valid;
        this.idEmpleado = idEmpleado;
        this.usuarioApp = usuarioApp;
        this.mensaje = mensaje;
    }

    // Constructor para token inválido
    public static ValidateTokenResponseDTO invalid(String mensaje) {
        return new ValidateTokenResponseDTO(false, null, null, mensaje);
    }

    // Constructor para token válido
    public static ValidateTokenResponseDTO valid(Long idEmpleado, String usuarioApp) {
        return new ValidateTokenResponseDTO(true, idEmpleado, usuarioApp, "Token válido");
    }

    // Getters y Setters
    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public Long getIdEmpleado() {
        return idEmpleado;
    }

    public void setIdEmpleado(Long idEmpleado) {
        this.idEmpleado = idEmpleado;
    }

    public String getUsuarioApp() {
        return usuarioApp;
    }

    public void setUsuarioApp(String usuarioApp) {
        this.usuarioApp = usuarioApp;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}
