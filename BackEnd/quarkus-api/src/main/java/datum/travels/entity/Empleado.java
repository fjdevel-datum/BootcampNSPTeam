package datum.travels.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Empleado")
public class Empleado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empleado")
    public Long idEmpleado;

    @ManyToOne
    @JoinColumn(name = "id_departamento")
    public Departamento departamento;

    @ManyToOne
    @JoinColumn(name = "id_cargo")
    public Cargo cargo;

    @ManyToOne
    @JoinColumn(name = "id_empresa")
    public Empresa empresa;

    @Column(name = "nombre", length = 50)
    public String nombre;

    @Column(name = "apellido", nullable = false, length = 50)
    public String apellido;

    @Column(name = "correo", nullable = false, unique = true, length = 50)
    public String correo;

    @Column(name = "telefono", length = 50)
    public String telefono;

    // Constructor vacío
    public Empleado() {}

    // Constructor con parámetros
    public Empleado(String nombre, String apellido, String correo) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo;
    }
}