package datum.travels.domain.repository;

import datum.travels.domain.model.Gasto;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de repositorio para Gasto (Clean Architecture)
 * La implementación estará en infrastructure/persistence
 */
public interface GastoRepository {

    /**
     * Lista todos los gastos de un evento específico
     *
     * @param idEvento ID del evento
     * @return Lista de gastos del evento
     */
    List<Gasto> findByIdEvento(Long idEvento);

    /**
     * Busca un gasto por su ID
     *
     * @param idGasto ID del gasto
     * @return Optional con el gasto si existe
     */
    Optional<Gasto> findByIdGasto(Long idGasto);

    /**
     * Persiste un nuevo gasto
     *
     * @param gasto Gasto a guardar
     * @return Gasto persistido con ID generado
     */
    Gasto save(Gasto gasto);

    /**
     * Elimina un gasto por su ID
     *
     * @param idGasto ID del gasto a eliminar
     * @return true si se eliminó, false si no existía
     */
    boolean deleteById(Long idGasto);

    /**
     * Elimina todos los gastos asociados a un evento
     *
     * @param idEvento ID del evento
     * @return Número de gastos eliminados
     */
    int deleteByIdEvento(Long idEvento);
}

