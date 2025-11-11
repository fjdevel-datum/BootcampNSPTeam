package datum.travels.domain.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Pais")
public class Pais {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pais")
    public Long idPais;

    @Column(name = "nombre_pais", nullable = false, length = 50)
    public String nombrePais;

    // Constructor vacío
    public Pais() {}

    // Constructor con parámetros
    public Pais(String nombrePais) {
        this.nombrePais = nombrePais;
    }
}