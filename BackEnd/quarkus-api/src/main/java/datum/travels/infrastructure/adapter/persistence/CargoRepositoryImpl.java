package datum.travels.infrastructure.adapter.persistence;

import datum.travels.domain.model.Cargo;
import datum.travels.domain.repository.CargoRepository;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

/**
 * Implementación JPA del repositorio de Cargo.
 */
@ApplicationScoped
public class CargoRepositoryImpl implements PanacheRepository<Cargo>, CargoRepository {

    @Override
    public Optional<Cargo> buscarPorId(Long idCargo) {
        return findByIdOptional(idCargo);
    }

    @Override
    public List<Cargo> listarTodos() {
        return listAll();
    }
}
