package datum.travels.application.dto.auth;

import java.time.LocalDateTime;

/**
 * DTO para representar una sesión activa
 * 
 * Contiene información completa del usuario autenticado:
 * - Datos personales del empleado
 * - Datos del usuario (username, roles)
 * - Información del cargo y departamento
 * - Estado de la sesión (token válido, fecha de validación)
 * 
 * Este DTO se usa para:
 * - Validar sesiones activas
 * - Mostrar info del usuario en el frontend
 * - Verificar permisos y roles
 */
public class SesionActivaDTO {

    // ────────────────────────────────────────────────────────
    // DATOS DEL EMPLEADO
    // ────────────────────────────────────────────────────────
    
    private Long idEmpleado;
    private String nombre;
    private String apellido;
    private String correo;
    private String telefono;
    
    // ────────────────────────────────────────────────────────
    // DATOS DEL USUARIO
    // ────────────────────────────────────────────────────────
    
    private Long idUsuario;
    private String username;
    
    // ────────────────────────────────────────────────────────
    // DATOS DE CARGO Y DEPARTAMENTO
    // ────────────────────────────────────────────────────────
    
    private Long cargoId;
    private String cargoNombre;
    
    private Long departamentoId;
    private String departamentoNombre;
    
    // ────────────────────────────────────────────────────────
    // DATOS DE LA SESIÓN
    // ────────────────────────────────────────────────────────
    
    private String token;                    // Token JWT actual
    private boolean tokenActivo;             // Si el token es válido
    private LocalDateTime fechaValidacion;   // Cuándo se validó
    private Long tiempoRestante;             // Segundos hasta expiración (opcional)
    
    // ────────────────────────────────────────────────────────
    // CONSTRUCTORS
    // ────────────────────────────────────────────────────────
    
    public SesionActivaDTO() {
    }

    // ────────────────────────────────────────────────────────
    // GETTERS AND SETTERS
    // ────────────────────────────────────────────────────────
    
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

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Long getCargoId() {
        return cargoId;
    }

    public void setCargoId(Long cargoId) {
        this.cargoId = cargoId;
    }

    public String getCargoNombre() {
        return cargoNombre;
    }

    public void setCargoNombre(String cargoNombre) {
        this.cargoNombre = cargoNombre;
    }

    public Long getDepartamentoId() {
        return departamentoId;
    }

    public void setDepartamentoId(Long departamentoId) {
        this.departamentoId = departamentoId;
    }

    public String getDepartamentoNombre() {
        return departamentoNombre;
    }

    public void setDepartamentoNombre(String departamentoNombre) {
        this.departamentoNombre = departamentoNombre;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public boolean isTokenActivo() {
        return tokenActivo;
    }

    public void setTokenActivo(boolean tokenActivo) {
        this.tokenActivo = tokenActivo;
    }

    public LocalDateTime getFechaValidacion() {
        return fechaValidacion;
    }

    public void setFechaValidacion(LocalDateTime fechaValidacion) {
        this.fechaValidacion = fechaValidacion;
    }

    public Long getTiempoRestante() {
        return tiempoRestante;
    }

    public void setTiempoRestante(Long tiempoRestante) {
        this.tiempoRestante = tiempoRestante;
    }

    // ────────────────────────────────────────────────────────
    // HELPER METHODS
    // ────────────────────────────────────────────────────────
    
    /**
     * Retorna el nombre completo del empleado
     */
    public String getNombreCompleto() {
        return nombre + " " + apellido;
    }
    
    /**
     * Verifica si la sesión aún es válida
     */
    public boolean esValida() {
        return tokenActivo && token != null && !token.isEmpty();
    }
    
    /**
     * Verifica si el token está próximo a expirar (menos de 5 minutos)
     */
    public boolean proximoAExpirar() {
        return tiempoRestante != null && tiempoRestante < 300; // 5 minutos
    }
}