package org.acme.ocrquarkus.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.ocrquarkus.entity.Gasto;

@ApplicationScoped
public class GastoRepository implements PanacheRepository<Gasto> {
    // Los métodos básicos de CRUD son heredados de PanacheRepository
}

