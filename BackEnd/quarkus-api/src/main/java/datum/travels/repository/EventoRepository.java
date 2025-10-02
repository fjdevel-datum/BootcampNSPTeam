package datum.travels.repository;

import datum.travels.entity.Evento;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

/**
 * Repository para acceso a datos de la tabla Evento
 */
@ApplicationScoped
public class EventoRepository implements PanacheRepository<Evento> {

    /**
     * Obtiene todos los eventos de un empleado específico
     * @param idEmpleado ID del empleado
     * @return Lista de eventos del empleado
     */
    public List<Evento> findByEmpleado(Long idEmpleado) {
        return list("idEmpleado", idEmpleado);
    }

    /**
     * Obtiene eventos por estado
     * @param estado Estado del evento (activo, completado, pendiente)
     * @return Lista de eventos con ese estado
     */
    public List<Evento> findByEstado(String estado) {
        return list("estado", estado);
    }

    /**
     * Obtiene eventos activos de un empleado
     * @param idEmpleado ID del empleado
     * @return Lista de eventos activos del empleado
     */
    public List<Evento> findEventosActivosByEmpleado(Long idEmpleado) {
        return list("idEmpleado = ?1 and estado = ?2", idEmpleado, "activo");
    }
}