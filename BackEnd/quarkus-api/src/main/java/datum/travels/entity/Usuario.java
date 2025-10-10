package datum.travels.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "id_empleado")
    private Long idEmpleado;

    @Column(name = "usuario_app", length = 50, nullable = false, unique = true)
    private String usuarioApp;

    @Column(name = "contraseña", length = 50, nullable = false)
    private String contrasena;

    // Relación con Empleado
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empleado", insertable = false, updatable = false)
    private Empleado empleado;

    // Constructor vacío
    public Usuario() {
    }

    // Constructor con parámetros
    public Usuario(Long idEmpleado, String usuarioApp, String contrasena) {
        this.idEmpleado = idEmpleado;
        this.usuarioApp = usuarioApp;
        this.contrasena = contrasena;
    }

    // GETTERS Y SETTERS

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
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

    public String getContrasena() {
        return contrasena;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }

    public Empleado getEmpleado() {
        return empleado;
    }

    public void setEmpleado(Empleado empleado) {
        this.empleado = empleado;
    }
}