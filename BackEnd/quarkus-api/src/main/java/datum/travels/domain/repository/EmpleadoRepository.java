package datum.travels.domain.repository;

import datum.travels.domain.model.Empleado;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio de dominio para Empleado
 */
public interface EmpleadoRepository {
    
    Optional<Empleado> buscarPorId(Long id);
    
    List<Empleado> listarTodos();
    
    Optional<Empleado> buscarPorUsuarioId(Long idUsuario);
    
    List<Empleado> listarPorDepartamento(Long idDepartamento);
    
    Empleado guardar(Empleado empleado);
    
    void eliminar(Long id);
    
    boolean existe(Long id);
}
