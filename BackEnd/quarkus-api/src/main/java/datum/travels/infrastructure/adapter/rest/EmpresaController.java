package datum.travels.infrastructure.adapter.rest;

import datum.travels.domain.model.Empresa;
import datum.travels.domain.repository.EmpresaRepository;
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
 * Endpoints de gestión de empresas.
 */
@Path("/api/empresas")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Empresas", description = "Gestión de empresas")
@Authenticated
public class EmpresaController {

    @Inject
    EmpresaRepository empresaRepository;

    @GET
    @Operation(summary = "Listar empresas", description = "Obtiene todas las empresas disponibles")
    public Response listar() {
        List<Empresa> empresas = empresaRepository.listarTodos();
        return Response.ok(empresas).build();
    }
}
