package datum.travels.application.usecase.gasto;

import datum.travels.domain.model.Gasto;

/**
 * Caso de uso: Registrar un gasto
 */
public interface RegistrarGastoUseCase {
    
    /**
     * Registra un nuevo gasto
     * @param gasto Datos del gasto
     * @return Gasto registrado
     */
    Gasto ejecutar(Gasto gasto);
}
