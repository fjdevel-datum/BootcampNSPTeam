package datum.travels.infrastructure.adapter.persistence;

import datum.travels.domain.model.Evento;
import datum.travels.domain.repository.EventoRepository;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Implementación JPA del repositorio de Evento
 * Usa Panache Repository para simplificar queries
 */
@ApplicationScoped
public class EventoRepositoryImpl implements PanacheRepository<Evento>, EventoRepository {

    @Override
    public List<Evento> findByIdEmpleado(Long idEmpleado) {
        return list("idEmpleado", idEmpleado);
    }

    @Override
    public Optional<Evento> findByIdEvento(Long idEvento) {
        return findByIdOptional(idEvento);
    }

    @Override
    @Transactional
    public Evento save(Evento evento) {
        persist(evento);
        return evento;
    }

    @Override
    @Transactional
    public Evento update(Evento evento) {
        return getEntityManager().merge(evento);
    }
}
