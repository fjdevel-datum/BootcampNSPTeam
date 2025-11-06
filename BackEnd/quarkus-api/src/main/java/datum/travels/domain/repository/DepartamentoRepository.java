package datum.travels.domain.repository;

import datum.travels.domain.model.Departamento;

import java.util.List;
import java.util.Optional;

/**
 * Puerto del repositorio de Departamento.
 */
public interface DepartamentoRepository {

    /**
     * Busca un departamento por su ID.
     *
     * @param idDepartamento ID del departamento
     * @return Optional con el departamento encontrado
     */
    Optional<Departamento> buscarPorId(Long idDepartamento);
    
    /**
     * Lista todos los departamentos disponibles.
     *
     * @return lista de departamentos
     */
    List<Departamento> listarTodos();
}
