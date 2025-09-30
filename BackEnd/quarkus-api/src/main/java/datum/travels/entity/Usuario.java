package datum.travels.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    public Long idUsuario;

    @ManyToOne
    @JoinColumn(name = "id_empleado")
    public Empleado empleado;

    @Column(name = "usuario_app", nullable = false, unique = true, length = 50)
    public String usuarioApp;

    @Column(name = "contraseña", nullable = false, length = 50)
    public String contrasena;

    // Constructor vacío
    public Usuario() {}

    // Constructor con parámetros
    public Usuario(Empleado empleado, String usuarioApp, String contrasena) {
        this.empleado = empleado;
        this.usuarioApp = usuarioApp;
        this.contrasena = contrasena;
    }
}