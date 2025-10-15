package datum.travels.domain.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "Adelanto_Viatico")
public class AdelantoViatico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_adelanto")
    public Long idAdelanto;

    @ManyToOne
    @JoinColumn(name = "id_evento", nullable = false)
    public Evento evento;

    @ManyToOne
    @JoinColumn(name = "id_empleado", nullable = false)
    public Empleado empleado;

    @Column(name = "monto", nullable = false, precision = 10, scale = 2)
    public BigDecimal monto;

    @Column(name = "fecha")
    public LocalDate fecha;

    // Constructor vacío
    public AdelantoViatico() {}

    // Constructor con parámetros
    public AdelantoViatico(Evento evento, Empleado empleado, BigDecimal monto) {
        this.evento = evento;
        this.empleado = empleado;
        this.monto = monto;
        this.fecha = LocalDate.now(); // Fecha actual por defecto
    }
}