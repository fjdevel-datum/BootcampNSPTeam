package datum.travels.infrastructure.adapter.persistence;

import datum.travels.domain.model.Tarjeta;
import datum.travels.domain.repository.TarjetaRepository;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@ApplicationScoped
public class TarjetaRepositoryImpl implements PanacheRepository<Tarjeta>, TarjetaRepository {

    @Override
    public Map<Long, Long> countByEmpleadoIds(List<Long> idsEmpleado) {
        if (idsEmpleado == null || idsEmpleado.isEmpty()) {
            return Collections.emptyMap();
        }

        List<Object[]> result = getEntityManager()
            .createQuery(
                "select t.empleado.idEmpleado, count(t) from Tarjeta t "
                    + "where t.empleado.idEmpleado in :ids "
                    + "group by t.empleado.idEmpleado",
                Object[].class
            )
            .setParameter("ids", idsEmpleado)
            .getResultList();

        return result.stream()
            .collect(Collectors.toMap(
                row -> (Long) row[0],
                row -> (Long) row[1]
            ));
    }

    @Override
    public List<Tarjeta> listarTodas() {
        return listAll();
    }

    @Override
    public Optional<Tarjeta> buscarPorId(Long idTarjeta) {
        return findByIdOptional(idTarjeta);
    }

    @Override
    public List<Tarjeta> buscarPorEmpleado(Long idEmpleado) {
        return list("empleado.idEmpleado", idEmpleado);
    }

    @Override
    public List<Tarjeta> buscarDisponibles() {
        return list("empleado is null");
    }

    @Override
    public boolean existePorNumero(String numeroTarjeta) {
        return count("numeroTarjeta", numeroTarjeta) > 0;
    }

    @Override
    @Transactional
    public Tarjeta guardar(Tarjeta tarjeta) {
        persist(tarjeta);
        return tarjeta;
    }

    @Override
    @Transactional
    public Tarjeta actualizar(Tarjeta tarjeta) {
        return getEntityManager().merge(tarjeta);
    }

    @Override
    @Transactional
    public void eliminar(Long idTarjeta) {
        deleteById(idTarjeta);
    }
}
