package datum.travels.entity;

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

    @Column(name = "nombre", length = 50)
    public String nombre;

    @Column(name = "fecha")
    public LocalDate fecha;

    @Column(name = "monto", precision = 10, scale = 2)
    public BigDecimal monto;

    @Column(name = "captura_comprobante", length = 200)
    public String capturaComprobante;

    // Constructor vacío
    public Gasto() {}

    // Constructor con parámetros
    public Gasto(Evento evento, String nombre, BigDecimal monto, LocalDate fecha) {
        this.evento = evento;
        this.nombre = nombre;
        this.monto = monto;
        this.fecha = fecha;
    }
}