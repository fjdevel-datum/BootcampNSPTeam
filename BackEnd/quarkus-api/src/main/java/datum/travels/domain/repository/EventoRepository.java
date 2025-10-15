package datum.travels.domain.repository;

import datum.travels.domain.model.Evento;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio de dominio para Evento
 * Define el contrato de persistencia sin depender de detalles de infraestructura
 */
public interface EventoRepository {
    
    /**
     * Busca un evento por ID
     */
    Optional<Evento> buscarPorId(Long id);
    
    /**
     * Lista todos los eventos
     */
    List<Evento> listarTodos();
    
    /**
     * Lista eventos activos
     */
    List<Evento> listarEventosActivos();
    
    /**
     * Lista eventos por empleado
     */
    List<Evento> listarPorEmpleado(Long idEmpleado);
    
    /**
     * Guarda o actualiza un evento
     */
    Evento guardar(Evento evento);
    
    /**
     * Elimina un evento
     */
    void eliminar(Long id);
    
    /**
     * Verifica si existe un evento
     */
    boolean existe(Long id);
}
