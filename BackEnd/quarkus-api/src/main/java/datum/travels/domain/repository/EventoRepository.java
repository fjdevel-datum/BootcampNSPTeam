package datum.travels.domain.repository;

import datum.travels.domain.model.Evento;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de repositorio para Evento (Clean Architecture)
 * La implementación estará en infrastructure/persistence
 */
public interface EventoRepository {

    /**
     * Lista todos los eventos de un empleado
     *
     * @param idEmpleado ID del empleado
     * @return Lista de eventos del empleado
     */
    List<Evento> findByIdEmpleado(Long idEmpleado);

    /**
     * Busca un evento por su ID
     *
     * @param idEvento ID del evento
     * @return Optional con el evento si existe
     */
    Optional<Evento> findByIdEvento(Long idEvento);

    /**
     * Persiste un nuevo evento
     *
     * @param evento Evento a guardar
     * @return Evento persistido con ID generado
     */
    Evento save(Evento evento);

    /**
     * Actualiza un evento existente
     *
     * @param evento Evento con datos actualizados
     * @return Evento actualizado
     */
    Evento update(Evento evento);

    /**
     * Elimina un evento por su ID
     *
     * @param idEvento ID del evento a eliminar
     * @return true si se eliminó, false si no existía
     */
    boolean deleteById(Long idEvento);
}
