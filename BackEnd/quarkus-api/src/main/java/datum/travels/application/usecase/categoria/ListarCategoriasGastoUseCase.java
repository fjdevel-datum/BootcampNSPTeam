package datum.travels.application.usecase.categoria;

import datum.travels.application.dto.categoria.CategoriaGastoDTO;
import datum.travels.domain.repository.CategoriaGastoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Use Case: Listar todas las categorías de gasto disponibles
 */
@ApplicationScoped
public class ListarCategoriasGastoUseCase {

    @Inject
    CategoriaGastoRepository categoriaRepository;

    public List<CategoriaGastoDTO> ejecutar() {
        return categoriaRepository.listarTodas()
            .stream()
            .map(categoria -> new CategoriaGastoDTO(
                categoria.idCategoria,
                categoria.nombreCategoria
            ))
            .collect(Collectors.toList());
    }
}
