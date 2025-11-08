package datum.travels.domain.repository;

import datum.travels.domain.model.Empresa;

import java.util.List;
import java.util.Optional;

/**
 * Puerto del repositorio de Empresa.
 */
public interface EmpresaRepository {

    /**
     * Busca una empresa por su ID.
     *
     * @param idEmpresa ID de la empresa
     * @return Optional con la empresa encontrada
     */
    Optional<Empresa> buscarPorId(Long idEmpresa);
    
    /**
     * Lista todas las empresas disponibles.
     *
     * @return lista de empresas
     */
    List<Empresa> listarTodos();
}
