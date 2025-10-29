package datum.travels.infrastructure.adapter.persistence;

import datum.travels.domain.model.Usuario;
import datum.travels.domain.repository.UsuarioRepository;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;

/**
 * Implementación JPA del repositorio de Usuario
 * Usa Panache Repository para simplificar queries
 */
@ApplicationScoped
public class UsuarioRepositoryImpl implements PanacheRepository<Usuario>, UsuarioRepository {

    @Override
    public Optional<Usuario> findByUsuarioApp(String usuarioApp) {
        return find("usuarioApp", usuarioApp).firstResultOptional();
    }

    // Renombrado para evitar conflicto con PanacheRepository.findById()
    @Override
    public Optional<Usuario> findByIdUsuario(Long idUsuario) {
        return findByIdOptional(idUsuario);
    }

    @Override
    public Optional<Usuario> findByKeycloakId(String keycloakId) {
        return find("keycloakId", keycloakId).firstResultOptional();
    }

    // persist() ya está heredado de PanacheRepository, 
    // pero lo declaramos explícitamente para cumplir con la interface
    @Override
    public void persist(Usuario usuario) {
        // Llama al método persist() de Panache
        PanacheRepository.super.persist(usuario);
    }
}
