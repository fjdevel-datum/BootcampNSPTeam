package datum.travels.domain.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "Liquidacion_Viatico")
public class LiquidacionViatico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_liquidacion")
    public Long idLiquidacion;

    @ManyToOne
    @JoinColumn(name = "id_evento", nullable = false)
    public Evento evento;

    @ManyToOne
    @JoinColumn(name = "id_empleado", nullable = false)
    public Empleado empleado;

    @Column(name = "total_adelanto", precision = 10, scale = 2)
    public BigDecimal totalAdelanto;

    @Column(name = "total_gastado", precision = 10, scale = 2)
    public BigDecimal totalGastado;

    @Column(name = "diferencia", precision = 10, scale = 2)
    public BigDecimal diferencia;

    @Column(name = "fecha")
    public LocalDate fecha;

    @Column(name = "estado", length = 20)
    public String estado;

    // Constructor vacío
    public LiquidacionViatico() {}

    // Constructor con parámetros
    public LiquidacionViatico(Evento evento, Empleado empleado) {
        this.evento = evento;
        this.empleado = empleado;
        this.totalAdelanto = BigDecimal.ZERO;
        this.totalGastado = BigDecimal.ZERO;
        this.diferencia = BigDecimal.ZERO;
        this.fecha = LocalDate.now();
    }
}