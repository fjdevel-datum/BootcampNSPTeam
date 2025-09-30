package datum.travels.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Categoria_Gasto")
public class CategoriaGasto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria")
    public Long idCategoria;

    @Column(name = "nombre_categoria", length = 50)
    public String nombreCategoria;

    // Constructor vacío
    public CategoriaGasto() {}

    // Constructor con parámetros
    public CategoriaGasto(String nombreCategoria) {
        this.nombreCategoria = nombreCategoria;
    }
}