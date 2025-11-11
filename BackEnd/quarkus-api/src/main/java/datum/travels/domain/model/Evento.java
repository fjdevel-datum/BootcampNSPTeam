package datum.travels.domain.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "Evento")
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evento")
    private Long idEvento;

    @Column(name = "id_empleado")
    private Long idEmpleado;

    @Column(name = "nombre_evento", length = 50)
    private String nombreEvento;

    @Column(name = "fecha_registro")
    private LocalDate fechaRegistro;

    @Column(name = "estado", length = 50)
    private String estado;

    // Relación con Empleado
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empleado", insertable = false, updatable = false)
    private Empleado empleado;

    // Constructor vacío (requerido por JPA)
    public Evento() {
    }

    // Constructor con parámetros
    public Evento(String nombreEvento, Long idEmpleado) {
        this.nombreEvento = nombreEvento;
        this.idEmpleado = idEmpleado;
        this.fechaRegistro = LocalDate.now();
        this.estado = "activo"; // Estado por defecto
    }

    // GETTERS Y SETTERS

    public Long getIdEvento() {
        return idEvento;
    }

    public void setIdEvento(Long idEvento) {
        this.idEvento = idEvento;
    }

    public Long getIdEmpleado() {
        return idEmpleado;
    }

    public void setIdEmpleado(Long idEmpleado) {
        this.idEmpleado = idEmpleado;
    }

    public String getNombreEvento() {
        return nombreEvento;
    }

    public void setNombreEvento(String nombreEvento) {
        this.nombreEvento = nombreEvento;
    }

    public LocalDate getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDate fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Empleado getEmpleado() {
        return empleado;
    }

    public void setEmpleado(Empleado empleado) {
        this.empleado = empleado;
    }
}