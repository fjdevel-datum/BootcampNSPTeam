package datum.travels.domain.repository;

import datum.travels.domain.model.Usuario;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio de dominio para Usuario
 */
public interface UsuarioRepository {
    
    Optional<Usuario> buscarPorId(Long id);
    
    List<Usuario> listarTodos();
    
    Optional<Usuario> buscarPorEmail(String email);
    
    Optional<Usuario> buscarPorUsername(String username);
    
    Usuario guardar(Usuario usuario);
    
    void eliminar(Long id);
    
    boolean existe(Long id);
    
    boolean existePorEmail(String email);
}
