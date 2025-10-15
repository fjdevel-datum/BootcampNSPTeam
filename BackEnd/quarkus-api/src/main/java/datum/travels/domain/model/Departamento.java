
package datum.travels.domain.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Departamento")
public class Departamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_departamento")
    public Long idDepartamento;

    @Column(name = "nombre_depart", nullable = false, length = 50)
    public String nombreDepart;

    @Column(name = "descripcion", length = 100)
    public String descripcion;

    // Constructor vacío
    public Departamento() {}

    // Constructor con parámetros
    public Departamento(String nombreDepart, String descripcion) {
        this.nombreDepart = nombreDepart;
        this.descripcion = descripcion;
    }
}