package datum.travels.infrastructure.adapter.persistence;

import datum.travels.domain.model.CategoriaGasto;
import datum.travels.domain.repository.CategoriaGastoRepository;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

/**
 * Implementación del repositorio de CategoriaGasto
 */
@ApplicationScoped
public class CategoriaGastoRepositoryImpl implements CategoriaGastoRepository, PanacheRepository<CategoriaGasto> {

    @Override
    public List<CategoriaGasto> listarTodas() {
        return listAll();
    }
}
