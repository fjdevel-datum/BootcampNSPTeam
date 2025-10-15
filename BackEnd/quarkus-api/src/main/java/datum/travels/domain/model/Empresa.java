package datum.travels.domain.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Empresa")
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empresa")
    public Long idEmpresa;

    @ManyToOne
    @JoinColumn(name = "id_pais")
    public Pais pais;

    @Column(name = "NRC", length = 60)
    public String nrc;

    @Column(name = "num_registro_tributario", nullable = false, length = 50)
    public String numRegistroTributario;

    @Column(name = "nombre_empresa", nullable = false, length = 50)
    public String nombreEmpresa;

    // Constructor vacío
    public Empresa() {}

    // Constructor con parámetros
    public Empresa(String nombreEmpresa, String numRegistroTributario, Pais pais) {
        this.nombreEmpresa = nombreEmpresa;
        this.numRegistroTributario = numRegistroTributario;
        this.pais = pais;
    }
}