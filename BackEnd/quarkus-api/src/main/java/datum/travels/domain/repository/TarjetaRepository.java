package datum.travels.domain.repository;

import datum.travels.domain.model.Tarjeta;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Puerto del repositorio de Tarjeta.
 */
public interface TarjetaRepository {

    /**
     * Cuenta la cantidad de tarjetas asociadas a cada empleado.
     *
     * @param idsEmpleado lista de IDs de empleado
     * @return mapa idEmpleado -> total de tarjetas
     */
    Map<Long, Long> countByEmpleadoIds(List<Long> idsEmpleado);
    
    /**
     * Listar todas las tarjetas registradas.
     *
     * @return lista de todas las tarjetas
     */
    List<Tarjeta> listarTodas();
    
    /**
     * Buscar tarjeta por ID.
     *
     * @param idTarjeta ID de la tarjeta
     * @return Optional con la tarjeta si existe
     */
    Optional<Tarjeta> buscarPorId(Long idTarjeta);
    
    /**
     * Buscar tarjetas asignadas a un empleado.
     *
     * @param idEmpleado ID del empleado
     * @return lista de tarjetas del empleado
     */
    List<Tarjeta> buscarPorEmpleado(Long idEmpleado);
    
    /**
     * Buscar tarjetas disponibles (sin asignar).
     *
     * @return lista de tarjetas sin empleado asignado
     */
    List<Tarjeta> buscarDisponibles();
    
    /**
     * Verificar si un número de tarjeta ya existe.
     *
     * @param numeroTarjeta número de la tarjeta
     * @return true si existe, false si no
     */
    boolean existePorNumero(String numeroTarjeta);
    
    /**
     * Guardar una nueva tarjeta.
     *
     * @param tarjeta tarjeta a guardar
     * @return tarjeta guardada con ID asignado
     */
    Tarjeta guardar(Tarjeta tarjeta);
    
    /**
     * Actualizar una tarjeta existente.
     *
     * @param tarjeta tarjeta con datos actualizados
     * @return tarjeta actualizada
     */
    Tarjeta actualizar(Tarjeta tarjeta);
    
    /**
     * Eliminar una tarjeta.
     *
     * @param idTarjeta ID de la tarjeta a eliminar
     */
    void eliminar(Long idTarjeta);
}
