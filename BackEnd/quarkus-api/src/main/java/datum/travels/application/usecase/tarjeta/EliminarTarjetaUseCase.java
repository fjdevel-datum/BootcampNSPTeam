package datum.travels.application.usecase.tarjeta;

import datum.travels.domain.repository.TarjetaRepository;
import datum.travels.shared.exception.BusinessException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

/**
 * Caso de uso para eliminar una tarjeta corporativa.
 */
@ApplicationScoped
public class EliminarTarjetaUseCase {

    @Inject
    TarjetaRepository tarjetaRepository;

    @Transactional
    public void execute(Long idTarjeta) {
        // 1. Validar que la tarjeta exista
        if (!tarjetaRepository.buscarPorId(idTarjeta).isPresent()) {
            throw new BusinessException("Tarjeta no encontrada con ID: " + idTarjeta);
        }
        
        // 2. Eliminar
        tarjetaRepository.eliminar(idTarjeta);
    }
}
