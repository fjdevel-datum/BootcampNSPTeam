package datum.travels.application.usecase.gasto;

import datum.travels.domain.exception.ResourceNotFoundException;
import datum.travels.domain.model.Gasto;
import datum.travels.domain.repository.GastoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

/**
 * Caso de Uso: Eliminar un Gasto
 * 
 * Responsabilidades:
 * 1. Verificar que el gasto existe
 * 2. Eliminar el gasto
 */
@ApplicationScoped
public class EliminarGastoUseCase {

    @Inject
    GastoRepository gastoRepository;

    /**
     * Elimina un gasto por su ID
     *
     * @param idGasto ID del gasto a eliminar
     * @throws ResourceNotFoundException si el gasto no existe
     */
    @Transactional
    public void execute(Long idGasto) {
        
        // Verificar que existe
        Gasto gasto = gastoRepository.findByIdGasto(idGasto)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Gasto no encontrado con ID: " + idGasto
                ));

        // Eliminar
        boolean eliminado = gastoRepository.deleteById(idGasto);
        
        if (!eliminado) {
            throw new ResourceNotFoundException(
                    "No se pudo eliminar el gasto con ID: " + idGasto
            );
        }
    }
}

