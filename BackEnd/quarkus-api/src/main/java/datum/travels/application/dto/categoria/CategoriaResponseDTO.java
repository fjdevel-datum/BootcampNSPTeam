package datum.travels.application.dto.categoria;

/**
 * DTO de respuesta para Categoría de Gasto
 * 
 * @author Datum Travels Team
 */
public class CategoriaResponseDTO {

    private Long idCategoria;
    private String nombreCategoria;

    // Constructores
    public CategoriaResponseDTO() {
    }

    public CategoriaResponseDTO(Long idCategoria, String nombreCategoria) {
        this.idCategoria = idCategoria;
        this.nombreCategoria = nombreCategoria;
    }

    // Getters y Setters
    public Long getIdCategoria() {
        return idCategoria;
    }

    public void setIdCategoria(Long idCategoria) {
        this.idCategoria = idCategoria;
    }

    public String getNombreCategoria() {
        return nombreCategoria;
    }

    public void setNombreCategoria(String nombreCategoria) {
        this.nombreCategoria = nombreCategoria;
    }
}
