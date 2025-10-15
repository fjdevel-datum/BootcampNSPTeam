package datum.travels.application.usecase.evento;

import datum.travels.domain.model.Evento;

/**
 * Caso de uso: Crear un nuevo evento
 */
public interface CrearEventoUseCase {
    
    /**
     * Crea un nuevo evento
     * @param evento Datos del evento
     * @return Evento creado
     */
    Evento ejecutar(Evento evento);
}
