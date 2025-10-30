package datum.travels.infrastructure.adapter.persistence;

import datum.travels.domain.model.Usuario;
import datum.travels.domain.repository.UsuarioRepository;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
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

    @Override
    public Optional<Usuario> findByIdUsuario(Long idUsuario) {
        return findByIdOptional(idUsuario);
    }

    @Override
    public Optional<Usuario> findByKeycloakId(String keycloakId) {
        return find("keycloakId", keycloakId).firstResultOptional();
    }

    @Override
    public void persist(Usuario usuario) {
        PanacheRepository.super.persist(usuario);
    }

    @Override
    public List<Usuario> findAllUsuarios() {
        return find("select distinct u from Usuario u " +
                "left join fetch u.empleado e " +
                "left join fetch e.cargo " +
                "left join fetch e.departamento " +
                "left join fetch e.empresa")
            .list();
    }
}
