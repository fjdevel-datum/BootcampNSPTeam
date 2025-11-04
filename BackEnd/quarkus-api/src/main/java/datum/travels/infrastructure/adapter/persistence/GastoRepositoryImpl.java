package datum.travels.infrastructure.adapter.persistence;

import datum.travels.domain.model.Gasto;
import datum.travels.domain.repository.GastoRepository;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Implementación JPA del repositorio de Gasto
 * Usa Panache Repository para simplificar queries
 */
@ApplicationScoped
public class GastoRepositoryImpl implements PanacheRepository<Gasto>, GastoRepository {

    @Override
    public List<Gasto> findByIdEvento(Long idEvento) {
        return list("evento.idEvento", idEvento);
    }

    @Override
    public Optional<Gasto> findByIdGasto(Long idGasto) {
        return findByIdOptional(idGasto);
    }

    @Override
    @Transactional
    public Gasto save(Gasto gasto) {
        persist(gasto);
        return gasto;
    }

    @Override
    @Transactional
    public boolean deleteById(Long idGasto) {
        return delete("idGasto", idGasto) > 0;
    }

    @Override
    @Transactional
    public int deleteByIdEvento(Long idEvento) {
        return (int) delete("evento.idEvento", idEvento);
    }
}

