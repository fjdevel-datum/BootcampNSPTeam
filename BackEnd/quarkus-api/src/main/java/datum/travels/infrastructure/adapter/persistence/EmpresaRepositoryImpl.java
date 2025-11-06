package datum.travels.infrastructure.adapter.persistence;

import datum.travels.domain.model.Empresa;
import datum.travels.domain.repository.EmpresaRepository;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

/**
 * Implementación JPA del repositorio de Empresa.
 */
@ApplicationScoped
public class EmpresaRepositoryImpl implements PanacheRepository<Empresa>, EmpresaRepository {

    @Override
    public Optional<Empresa> buscarPorId(Long idEmpresa) {
        return findByIdOptional(idEmpresa);
    }

    @Override
    public List<Empresa> listarTodos() {
        return listAll();
    }
}
