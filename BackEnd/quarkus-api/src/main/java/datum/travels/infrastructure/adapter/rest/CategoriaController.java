package datum.travels.infrastructure.adapter.rest;

import datum.travels.application.dto.categoria.CategoriaGastoDTO;
import datum.travels.application.usecase.categoria.ListarCategoriasGastoUseCase;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

/**
 * REST Controller: Endpoints de categorías
 * GET /api/categorias
 */
@Path("/api/categorias")
@Produces(MediaType.APPLICATION_JSON)
public class CategoriaController {

    @Inject
    ListarCategoriasGastoUseCase listarCategoriasUseCase;

    @GET
    public Response listarCategorias() {
        List<CategoriaGastoDTO> categorias = listarCategoriasUseCase.ejecutar();
        return Response.ok(categorias).build();
    }
}
