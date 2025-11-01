package datum.travels.application.usecase.pais;

import datum.travels.domain.model.Pais;
import datum.travels.domain.repository.PaisRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;

/**
 * Caso de uso para listar todos los países.
 */
@ApplicationScoped
public class ListarPaisesUseCase {

    @Inject
    PaisRepository paisRepository;

    public List<Pais> execute() {
        return paisRepository.listarTodos();
    }
}
