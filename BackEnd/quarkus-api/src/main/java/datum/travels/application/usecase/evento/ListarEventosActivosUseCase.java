package datum.travels.application.usecase.evento;

import datum.travels.domain.model.Evento;
import java.util.List;

/**
 * Caso de uso: Listar eventos activos
 */
public interface ListarEventosActivosUseCase {
    
    /**
     * Lista todos los eventos activos
     * @return Lista de eventos activos
     */
    List<Evento> ejecutar();
}
