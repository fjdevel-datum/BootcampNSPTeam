package datum.travels.domain.repository;

import java.util.List;
import java.util.Map;

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
}
