package datum.travels.domain.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "Gasto")
public class Gasto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_gasto")
    public Long idGasto;

    @ManyToOne
    @JoinColumn(name = "id_evento")
    public Evento evento;

    @ManyToOne
    @JoinColumn(name = "id_tarjeta")
    public Tarjeta tarjeta;

    @ManyToOne
    @JoinColumn(name = "id_categoria")
    public CategoriaGasto categoria;

    @Column(name = "descripcion", length = 50)
    public String descripcion;

    @Column(name = "lugar", length = 100)
    public String lugar;

    @Column(name = "fecha")
    public LocalDate fecha;

    @Column(name = "monto", precision = 10, scale = 2)
    public BigDecimal monto;

    @Column(name = "captura_comprobante", length = 200)
    public String capturaComprobante;

    // Constructor vacío
    public Gasto() {}

    // Constructor actualizado
    public Gasto(Evento evento, String descripcion, String lugar, BigDecimal monto, LocalDate fecha) {
        this.evento = evento;
        this.descripcion = descripcion;
        this.lugar = lugar;
        this.monto = monto;
        this.fecha = fecha;
    }
}