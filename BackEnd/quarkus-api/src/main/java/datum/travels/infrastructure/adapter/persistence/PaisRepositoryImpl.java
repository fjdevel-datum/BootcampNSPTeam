package datum.travels.infrastructure.adapter.persistence;

import datum.travels.domain.model.Pais;
import datum.travels.domain.repository.PaisRepository;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

/**
 * Implementación JPA del repositorio de País.
 */
@ApplicationScoped
public class PaisRepositoryImpl implements PanacheRepository<Pais>, PaisRepository {

    @Override
    public Optional<Pais> buscarPorId(Long idPais) {
        return findByIdOptional(idPais);
    }

    @Override
    public List<Pais> listarTodos() {
        return listAll();
    }
}
