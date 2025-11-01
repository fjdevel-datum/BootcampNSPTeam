package datum.travels.infrastructure.adapter.rest;

import datum.travels.application.usecase.pais.ListarPaisesUseCase;
import datum.travels.domain.model.Pais;
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
 * Endpoints de gestión de países.
 */
@Path("/api/paises")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Países", description = "Gestión de países")
@Authenticated
public class PaisController {

    @Inject
    ListarPaisesUseCase listarPaisesUseCase;

    @GET
    @Operation(summary = "Listar países", description = "Obtiene todos los países disponibles")
    public Response listar() {
        List<Pais> paises = listarPaisesUseCase.execute();
        return Response.ok(paises).build();
    }
}
