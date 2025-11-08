package datum.travels.infrastructure.adapter.rest;

import datum.travels.domain.model.Cargo;
import datum.travels.domain.repository.CargoRepository;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;

/**
 * Endpoints de gestión de cargos.
 */
@Path("/api/cargos")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Cargos", description = "Gestión de cargos")
@Authenticated
public class CargoController {

    @Inject
    CargoRepository cargoRepository;

    @GET
    @Operation(summary = "Listar cargos", description = "Obtiene todos los cargos disponibles")
    public Response listar() {
        List<Cargo> cargos = cargoRepository.listarTodos();
        return Response.ok(cargos).build();
    }
}
