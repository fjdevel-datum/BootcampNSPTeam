package datum.travels.infrastructure.adapter.rest;

import datum.travels.domain.model.Departamento;
import datum.travels.domain.repository.DepartamentoRepository;
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
 * Endpoints de gestión de departamentos.
 */
@Path("/api/departamentos")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Departamentos", description = "Gestión de departamentos")
@Authenticated
public class DepartamentoController {

    @Inject
    DepartamentoRepository departamentoRepository;

    @GET
    @Operation(summary = "Listar departamentos", description = "Obtiene todos los departamentos disponibles")
    public Response listar() {
        List<Departamento> departamentos = departamentoRepository.listarTodos();
        return Response.ok(departamentos).build();
    }
}
