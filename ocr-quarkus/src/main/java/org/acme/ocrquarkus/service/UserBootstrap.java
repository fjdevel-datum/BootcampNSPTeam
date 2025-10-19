package org.acme.ocrquarkus.service;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.acme.ocrquarkus.entity.Usuario;
import org.acme.ocrquarkus.repository.UsuarioRepository;

@ApplicationScoped
public class UserBootstrap {

    @Inject
    UsuarioRepository usuarioRepository;

    @Transactional
    void onStart(@Observes StartupEvent ev) {
        // Requisito: solo debe existir admin/admin
        usuarioRepository.deleteAll();
        Usuario admin = new Usuario("admin", "admin");
        usuarioRepository.persist(admin);
    }
}

