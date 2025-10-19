package datum.travels.application.dto.auth;

/**
 * DTO para enviar la respuesta del login al frontend
 * Incluye el token JWT y datos básicos del empleado autenticado
 */
public class LoginResponseDTO {

    private Long idEmpleado;
    private String nombre;
    private String apellido;
    private String correo;
    private String cargo;
    private String departamento;
    
    // ═══════════════════════════════════════════════════
    // NUEVOS CAMPOS PARA JWT
    // ═══════════════════════════════════════════════════
    private String token;        // Token JWT para las siguientes peticiones
    private String tokenType;    // Tipo de token (normalmente "Bearer")
    private Long expiresIn;      // Tiempo de expiración en segundos
    
    private String mensaje;
    private boolean exitoso;

    // ────────────────────────────────────────────────────
    // CONSTRUCTORS
    // ────────────────────────────────────────────────────
    
    public LoginResponseDTO() {
        this.tokenType = "Bearer";  // Por defecto
    }

    public LoginResponseDTO(Long idEmpleado, String nombre, String apellido, 
                           String correo, String token) {
        this.idEmpleado = idEmpleado;
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo;
        this.token = token;
        this.tokenType = "Bearer";
    }

    // ────────────────────────────────────────────────────
    // BUILDER PATTERN HELPERS
    // ────────────────────────────────────────────────────
    
    public static LoginResponseDTO success(Long idEmpleado, String nombre, 
                                          String apellido, String correo, 
                                          String token) {
        LoginResponseDTO dto = new LoginResponseDTO(
            idEmpleado, nombre, apellido, correo, token
        );
        dto.setMensaje("Autenticación exitosa");
        dto.setExitoso(true);
        return dto;
    }

    public static LoginResponseDTO error(String mensaje) {
        LoginResponseDTO dto = new LoginResponseDTO();
        dto.setMensaje(mensaje);
        dto.setExitoso(false);
        return dto;
    }

    // ────────────────────────────────────────────────────
    // GETTERS AND SETTERS
    // ────────────────────────────────────────────────────
    
    public Long getIdEmpleado() {
        return idEmpleado;
    }

    public void setIdEmpleado(Long idEmpleado) {
        this.idEmpleado = idEmpleado;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }

    public String getDepartamento() {
        return departamento;
    }

    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public Long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(Long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public boolean isExitoso() {
        return exitoso;
    }

    public void setExitoso(boolean exitoso) {
        this.exitoso = exitoso;
    }
    
    // ────────────────────────────────────────────────────
    // HELPER METHOD
    // ────────────────────────────────────────────────────
    
    /**
     * Retorna el nombre completo del empleado
     */
    public String getNombreCompleto() {
        return nombre + " " + apellido;
    }
}