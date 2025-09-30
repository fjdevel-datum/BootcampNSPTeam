package datum.travels.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Cargo")
public class Cargo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cargo")
    public Long idCargo;

    @Column(name = "nombre", unique = true, nullable = false, length = 50)
    public String nombre;

    @Column(name = "descripcion", length = 100)
    public String descripcion;

    // Constructor vacío
    public Cargo() {}

    // Constructor con parámetros
    public Cargo(String nombre, String descripcion) {
        this.nombre = nombre;
        this.descripcion = descripcion;
    }
}