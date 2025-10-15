package datum.travels.application.usecase.evento;

import datum.travels.domain.model.Evento;
import datum.travels.domain.repository.EventoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;

/**
 * Implementación del caso de uso: Listar Eventos Activos
 */
@ApplicationScoped
public class ListarEventosActivosUseCaseImpl implements ListarEventosActivosUseCase {

    @Inject
    EventoRepository eventoRepository;

    @Override
    public List<Evento> ejecutar() {
        return eventoRepository.listarEventosActivos();
    }
}
