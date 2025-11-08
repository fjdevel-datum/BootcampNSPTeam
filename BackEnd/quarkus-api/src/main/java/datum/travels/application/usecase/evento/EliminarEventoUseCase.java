package datum.travels.application.usecase.evento;

import datum.travels.domain.exception.ResourceNotFoundException;
import datum.travels.domain.repository.EventoRepository;
import datum.travels.domain.repository.GastoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

/**
 * Caso de Uso: Eliminar un Evento
 * 
 * Responsabilidades:
 * 1. Verificar que el evento existe
 * 2. Eliminar todos los gastos asociados al evento (CASCADE)
 * 3. Eliminar el evento
 * 4. Retornar confirmación
 */
@ApplicationScoped
public class EliminarEventoUseCase {

    private static final Logger LOG = Logger.getLogger(EliminarEventoUseCase.class);

    @Inject
    EventoRepository eventoRepository;

    @Inject
    GastoRepository gastoRepository;

    /**
     * Elimina un evento y todos sus gastos asociados
     *
     * @param idEvento ID del evento a eliminar
     * @throws ResourceNotFoundException si el evento no existe
     */
    @Transactional
    public void execute(Long idEvento) {
        LOG.infof("🗑️ Iniciando eliminación del evento ID: %d", idEvento);

        // Verificar que el evento existe
        eventoRepository.findByIdEvento(idEvento)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Evento con ID " + idEvento + " no encontrado"
            ));

        // 1️⃣ Primero eliminar todos los gastos asociados (CASCADE)
        int gastosEliminados = gastoRepository.deleteByIdEvento(idEvento);
        LOG.infof("✅ Se eliminaron %d gastos del evento ID: %d", gastosEliminados, idEvento);

        // 2️⃣ Luego eliminar el evento
        boolean eventoEliminado = eventoRepository.deleteById(idEvento);
        
        if (eventoEliminado) {
            LOG.infof("✅ Evento ID: %d eliminado exitosamente", idEvento);
        } else {
            LOG.warnf("⚠️ No se pudo eliminar el evento ID: %d", idEvento);
            throw new RuntimeException("Error al eliminar el evento");
        }
    }
}
