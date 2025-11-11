package datum.travels.domain.repository;

import datum.travels.domain.model.Cargo;

import java.util.List;
import java.util.Optional;

/**
 * Puerto del repositorio de Cargo.
 */
public interface CargoRepository {

    /**
     * Busca un cargo por su ID.
     *
     * @param idCargo ID del cargo
     * @return Optional con el cargo encontrado
     */
    Optional<Cargo> buscarPorId(Long idCargo);
    
    /**
     * Lista todos los cargos disponibles.
     *
     * @return lista de cargos
     */
    List<Cargo> listarTodos();
}
