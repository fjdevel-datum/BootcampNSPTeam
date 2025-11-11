package datum.travels.domain.repository;

import datum.travels.domain.model.Empleado;

import java.util.Optional;

/**
 * Puerto del repositorio de Empleado.
 */
public interface EmpleadoRepository {

    /**
     * Persiste un nuevo empleado en la base de datos.
     *
     * @param empleado entidad a guardar
     * @return entidad con el ID generado
     */
    Empleado save(Empleado empleado);

    /**
     * Busca un empleado por su correo institucional.
     *
     * @param correo correo del empleado
     * @return Optional con el empleado encontrado
     */
    Optional<Empleado> findByCorreo(String correo);
    
    /**
     * Busca un empleado por su ID.
     *
     * @param idEmpleado ID del empleado
     * @return Optional con el empleado encontrado
     */
    Optional<Empleado> buscarPorId(Long idEmpleado);
    
    /**
     * Actualiza los datos de un empleado existente.
     *
     * @param empleado entidad con los datos actualizados
     * @return entidad actualizada
     */
    Empleado update(Empleado empleado);
}
