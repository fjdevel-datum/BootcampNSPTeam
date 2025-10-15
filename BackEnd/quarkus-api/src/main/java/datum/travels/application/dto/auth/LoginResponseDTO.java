package datum.travels.application.dto.auth;

/**
 * DTO para enviar la respuesta del login al frontend
 * Contiene información básica del empleado autenticado
 */
public class LoginResponseDTO {

    private Long idEmpleado;
    private String nombre;
    private String apellido;
    private String correo;
    private String cargo;
    private String departamento;
    private String mensaje;

    // Constructors
    public LoginResponseDTO() {
    }

    public LoginResponseDTO(Long idEmpleado, String nombre, String apellido, String correo) {
        this.idEmpleado = idEmpleado;
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo;
    }

    // Builder pattern helper
    public static LoginResponseDTO success(Long idEmpleado, String nombre, String apellido, String correo) {
        LoginResponseDTO dto = new LoginResponseDTO(idEmpleado, nombre, apellido, correo);
        dto.setMensaje("Login exitoso");
        return dto;
    }

    public static LoginResponseDTO error(String mensaje) {
        LoginResponseDTO dto = new LoginResponseDTO();
        dto.setMensaje(mensaje);
        return dto;
    }

    // Getters and Setters
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

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}