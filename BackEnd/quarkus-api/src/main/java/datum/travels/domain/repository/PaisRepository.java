package datum.travels.domain.repository;

import datum.travels.domain.model.Pais;

import java.util.List;
import java.util.Optional;

/**
 * Puerto del repositorio de País.
 */
public interface PaisRepository {

    /**
     * Busca un país por su ID.
     *
     * @param idPais ID del país
     * @return Optional con el país encontrado
     */
    Optional<Pais> buscarPorId(Long idPais);
    
    /**
     * Lista todos los países disponibles.
     *
     * @return lista de países
     */
    List<Pais> listarTodos();
}
