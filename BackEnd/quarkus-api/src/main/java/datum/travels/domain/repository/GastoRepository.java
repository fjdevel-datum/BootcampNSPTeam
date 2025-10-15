package datum.travels.domain.repository;

import datum.travels.domain.model.Gasto;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio de dominio para Gasto
 */
public interface GastoRepository {
    
    Optional<Gasto> buscarPorId(Long id);
    
    List<Gasto> listarTodos();
    
    List<Gasto> listarPorEvento(Long idEvento);
    
    List<Gasto> listarPorEmpleado(Long idEmpleado);
    
    Gasto guardar(Gasto gasto);
    
    void eliminar(Long id);
    
    boolean existe(Long id);
    
    /**
     * Calcula el total de gastos por evento
     */
    Double calcularTotalPorEvento(Long idEvento);
}
