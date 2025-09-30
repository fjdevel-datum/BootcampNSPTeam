package datum.travels.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "Tarjeta")
public class Tarjeta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tarjeta")
    public Long idTarjeta;

    @ManyToOne
    @JoinColumn(name = "id_empleado")
    public Empleado empleado;

    @ManyToOne
    @JoinColumn(name = "id_pais")
    public Pais pais;

    @Column(name = "banco", nullable = false, length = 100)
    public String banco;

    @Column(name = "numero_tarjeta", nullable = false, unique = true, length = 25)
    public String numeroTarjeta;

    @Column(name = "fecha_expiracion")
    public LocalDate fechaExpiracion;

    // Constructor vacío
    public Tarjeta() {}

    // Constructor con parámetros
    public Tarjeta(Empleado empleado, String banco, String numeroTarjeta) {
        this.empleado = empleado;
        this.banco = banco;
        this.numeroTarjeta = numeroTarjeta;
    }
}