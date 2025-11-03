package datum.travels.infrastructure.adapter.persistence;

import datum.travels.domain.model.Empleado;
import datum.travels.domain.repository.EmpleadoRepository;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.util.Optional;

/**
 * Implementación JPA del repositorio de Empleado.
 */
@ApplicationScoped
public class EmpleadoRepositoryImpl implements PanacheRepository<Empleado>, EmpleadoRepository {

    @Override
    @Transactional
    public Empleado save(Empleado empleado) {
        persist(empleado);
        return empleado;
    }

    @Override
    public Optional<Empleado> findByCorreo(String correo) {
        return find("correo", correo).firstResultOptional();
    }
    
    @Override
    public Optional<Empleado> buscarPorId(Long idEmpleado) {
        return findByIdOptional(idEmpleado);
    }
    
    @Override
    @Transactional
    public Empleado update(Empleado empleado) {
        return getEntityManager().merge(empleado);
    }
}
