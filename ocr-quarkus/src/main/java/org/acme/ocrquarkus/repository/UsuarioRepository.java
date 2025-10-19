package org.acme.ocrquarkus.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.ocrquarkus.entity.Usuario;

import java.util.Optional;

@ApplicationScoped
public class UsuarioRepository implements PanacheRepository<Usuario> {

    public Optional<Usuario> findByNombreUsuario(String nombreUsuario) {
        return find("nombreUsuario", nombreUsuario).firstResultOptional();
    }
}

