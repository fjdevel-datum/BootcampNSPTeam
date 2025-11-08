package datum.travels.infrastructure.adapter.persistence;

import datum.travels.domain.model.Departamento;
import datum.travels.domain.repository.DepartamentoRepository;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

/**
 * Implementación JPA del repositorio de Departamento.
 */
@ApplicationScoped
public class DepartamentoRepositoryImpl implements PanacheRepository<Departamento>, DepartamentoRepository {

    @Override
    public Optional<Departamento> buscarPorId(Long idDepartamento) {
        return findByIdOptional(idDepartamento);
    }

    @Override
    public List<Departamento> listarTodos() {
        return listAll();
    }
}
