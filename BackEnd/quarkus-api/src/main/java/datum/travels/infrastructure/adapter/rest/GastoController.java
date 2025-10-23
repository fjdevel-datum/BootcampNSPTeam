package datum.travels.infrastructure.adapter.rest;

import datum.travels.application.dto.gasto.CrearGastoRequest;
import datum.travels.application.dto.gasto.GastoResponse;
import datum.travels.application.usecase.gasto.CrearGastoUseCase;
import datum.travels.application.usecase.gasto.EliminarGastoUseCase;
import datum.travels.application.usecase.gasto.ListarGastosPorEventoUseCase;
import datum.travels.domain.exception.ResourceNotFoundException;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;

/**
 * Controlador REST para gestión de Gastos
 * 
 * Endpoints disponibles:
 * - POST   /api/gastos              → Registrar nuevo gasto
 * - GET    /api/gastos/evento/{id}  → Listar gastos de un evento
 * - DELETE /api/gastos/{id}         → Eliminar gasto
 */
@Path("/api/gastos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Gastos", description = "Gestión de gastos de eventos")
public class GastoController {

    @Inject
    CrearGastoUseCase crearGastoUseCase;

    @Inject
    ListarGastosPorEventoUseCase listarGastosPorEventoUseCase;

    @Inject
    EliminarGastoUseCase eliminarGastoUseCase;

    /**
     * Registra un nuevo gasto vinculado a un evento
     * 
     * @param request Datos del gasto a crear
     * @return 201 Created con el gasto creado
     */
    @POST
    @Operation(summary = "Registrar nuevo gasto", 
               description = "Crea un nuevo gasto vinculado a un evento (después de procesar OCR)")
    @APIResponses({
        @APIResponse(responseCode = "201", description = "Gasto creado exitosamente"),
        @APIResponse(responseCode = "400", description = "Datos inválidos"),
        @APIResponse(responseCode = "404", description = "Evento, categoría o tarjeta no encontrada")
    })
    public Response crearGasto(@Valid CrearGastoRequest request) {
        try {
            GastoResponse gasto = crearGastoUseCase.execute(request);
            return Response.status(Response.Status.CREATED).entity(gasto).build();
            
        } catch (ResourceNotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }

    /**
     * Lista todos los gastos de un evento específico
     * 
     * @param idEvento ID del evento
     * @return 200 OK con lista de gastos
     */
    @GET
    @Path("/evento/{idEvento}")
    @Operation(summary = "Listar gastos de un evento", 
               description = "Obtiene todos los gastos registrados para un evento")
    @APIResponses({
        @APIResponse(responseCode = "200", description = "Lista de gastos obtenida exitosamente")
    })
    public Response listarGastosPorEvento(
            @Parameter(description = "ID del evento", required = true)
            @PathParam("idEvento") Long idEvento) {
        
        List<GastoResponse> gastos = listarGastosPorEventoUseCase.execute(idEvento);
        return Response.ok(gastos).build();
    }

    /**
     * Elimina un gasto por su ID
     * 
     * @param idGasto ID del gasto a eliminar
     * @return 204 No Content si se eliminó correctamente
     */
    @DELETE
    @Path("/{idGasto}")
    @Operation(summary = "Eliminar gasto", 
               description = "Elimina un gasto registrado")
    @APIResponses({
        @APIResponse(responseCode = "204", description = "Gasto eliminado exitosamente"),
        @APIResponse(responseCode = "404", description = "Gasto no encontrado")
    })
    public Response eliminarGasto(
            @Parameter(description = "ID del gasto", required = true)
            @PathParam("idGasto") Long idGasto) {
        
        try {
            eliminarGastoUseCase.execute(idGasto);
            return Response.noContent().build();
            
        } catch (ResourceNotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }

    /**
     * Clase interna para respuestas de error
     */
    public static record ErrorResponse(String mensaje) {}
}

