package datum.travels.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "Evento")
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evento")
    public Long idEvento;

    @ManyToOne
    @JoinColumn(name = "id_empleado")
    public Empleado empleado;

    @Column(name = "nombre_evento", length = 50)
    public String nombreEvento;

    @Column(name = "fecha_inicio")
    public LocalDate fechaInicio;

    @Column(name = "fecha_regreso")
    public LocalDate fechaRegreso;

    @Column(name = "destino", length = 100)
    public String destino;

    @Column(name = "estado", length = 50)
    public String estado;

    // Constructor vacío
    public Evento() {}

    // Constructor con parámetros
    public Evento(String nombreEvento, Empleado empleado, LocalDate fechaInicio, LocalDate fechaRegreso) {
        this.nombreEvento = nombreEvento;
        this.empleado = empleado;
        this.fechaInicio = fechaInicio;
        this.fechaRegreso = fechaRegreso;
    }
}