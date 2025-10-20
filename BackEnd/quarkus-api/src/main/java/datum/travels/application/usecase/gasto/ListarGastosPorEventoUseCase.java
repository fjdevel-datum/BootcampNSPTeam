package datum.travels.application.usecase.gasto;

import datum.travels.application.dto.gasto.GastoResponse;
import datum.travels.domain.model.Gasto;
import datum.travels.domain.repository.GastoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Caso de Uso: Listar Gastos de un Evento
 * 
 * Responsabilidades:
 * 1. Obtener todos los gastos de un evento
 * 2. Convertir a DTOs
 * 3. Retornar lista
 */
@ApplicationScoped
public class ListarGastosPorEventoUseCase {

    @Inject
    GastoRepository gastoRepository;

    /**
     * Lista todos los gastos de un evento específico
     *
     * @param idEvento ID del evento
     * @return Lista de gastos del evento
     */
    public List<GastoResponse> execute(Long idEvento) {
        List<Gasto> gastos = gastoRepository.findByIdEvento(idEvento);
        
        return gastos.stream()
                .map(GastoResponse::from)
                .collect(Collectors.toList());
    }
}
