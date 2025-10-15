package datum.travels.domain.repository;

import datum.travels.domain.model.Tarjeta;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio de dominio para Tarjeta
 */
public interface TarjetaRepository {
    
    Optional<Tarjeta> buscarPorId(Long id);
    
    List<Tarjeta> listarTodas();
    
    List<Tarjeta> listarPorEmpleado(Long idEmpleado);
    
    Optional<Tarjeta> buscarPorNumeroTarjeta(String numeroTarjeta);
    
    Tarjeta guardar(Tarjeta tarjeta);
    
    void eliminar(Long id);
    
    boolean existe(Long id);
}
