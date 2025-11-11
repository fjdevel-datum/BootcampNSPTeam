package datum.travels.domain.repository;

import datum.travels.domain.model.CategoriaGasto;
import java.util.List;

/**
 * Contrato del repositorio de CategoriaGasto
 */
public interface CategoriaGastoRepository {
    List<CategoriaGasto> listarTodas();
}
