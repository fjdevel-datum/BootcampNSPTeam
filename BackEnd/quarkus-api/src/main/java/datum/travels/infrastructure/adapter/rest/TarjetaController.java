package datum.travels.infrastructure.adapter.rest;

import datum.travels.application.dto.tarjeta.AsignarTarjetaRequest;
import datum.travels.application.dto.tarjeta.TarjetaRequest;
import datum.travels.application.dto.tarjeta.TarjetaResponse;
import datum.travels.application.usecase.tarjeta.AsignarTarjetaUseCase;
import datum.travels.application.usecase.tarjeta.CrearTarjetaUseCase;
import datum.travels.application.usecase.tarjeta.EliminarTarjetaUseCase;
import datum.travels.application.usecase.tarjeta.ListarTarjetasUseCase;
import datum.travels.application.usecase.tarjeta.ObtenerTarjetasEmpleadoUseCase;
import datum.travels.shared.exception.BusinessException;
import io.quarkus.security.Authenticated;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;

/**
 * Endpoints de gestión de tarjetas corporativas.
 */
@Path("/api/tarjetas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Tarjetas", description = "Gestión de tarjetas corporativas")
@Authenticated
public class TarjetaController {

    @Inject
    ListarTarjetasUseCase listarTarjetasUseCase;

    @Inject
    CrearTarjetaUseCase crearTarjetaUseCase;

    @Inject
    AsignarTarjetaUseCase asignarTarjetaUseCase;

    @Inject
    EliminarTarjetaUseCase eliminarTarjetaUseCase;

    @Inject
    ObtenerTarjetasEmpleadoUseCase obtenerTarjetasEmpleadoUseCase;

    @GET
    @RolesAllowed({"admin", "administrador", "usuario"})
    @Operation(summary = "Listar tarjetas", description = "Obtiene todas las tarjetas corporativas registradas")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Listado de tarjetas", content = @Content(
            schema = @Schema(implementation = TarjetaResponse.class)
        ))
    })
    public Response listar() {
        List<TarjetaResponse> tarjetas = listarTarjetasUseCase.execute();
        return Response.ok(tarjetas).build();
    }

    @GET
    @Path("/mis-tarjetas")
    @RolesAllowed({"admin", "administrador", "usuario"})
    @Operation(
        summary = "Mis tarjetas", 
        description = "Obtiene las tarjetas asignadas al empleado autenticado"
    )
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Tarjetas del empleado", content = @Content(
            schema = @Schema(implementation = TarjetaResponse.class)
        )),
        @APIResponse(responseCode = "400", description = "Usuario no identificado o empleado no encontrado")
    })
    public Response misTarjetas() {
        try {
            List<TarjetaResponse> tarjetas = obtenerTarjetasEmpleadoUseCase.execute();
            return Response.ok(tarjetas).build();
        } catch (BusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(ex.getMessage()))
                .build();
        } catch (Exception ex) {
            return Response.serverError()
                .entity(new ErrorResponse("Error inesperado al obtener las tarjetas"))
                .build();
        }
    }

    @POST
    @RolesAllowed({"admin", "administrador"})
    @Operation(
        summary = "Crear tarjeta",
        description = "Registra una nueva tarjeta corporativa, opcionalmente asignada a un empleado"
    )
    @APIResponses(value = {
        @APIResponse(responseCode = "201", description = "Tarjeta creada", content = @Content(
            schema = @Schema(implementation = TarjetaResponse.class)
        )),
        @APIResponse(responseCode = "400", description = "Validación de negocio fallida")
    })
    public Response crear(@Valid TarjetaRequest request) {
        try {
            TarjetaResponse response = crearTarjetaUseCase.execute(request);
            return Response.status(Response.Status.CREATED).entity(response).build();
        } catch (BusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(ex.getMessage()))
                .build();
        } catch (Exception ex) {
            return Response.serverError()
                .entity(new ErrorResponse("Error inesperado al crear la tarjeta"))
                .build();
        }
    }

    @PUT
    @Path("/asignar")
    @RolesAllowed({"admin", "administrador"})
    @Operation(
        summary = "Asignar tarjeta",
        description = "Asigna una tarjeta a un empleado específico"
    )
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Tarjeta asignada", content = @Content(
            schema = @Schema(implementation = TarjetaResponse.class)
        )),
        @APIResponse(responseCode = "400", description = "Validación de negocio fallida")
    })
    public Response asignar(@Valid AsignarTarjetaRequest request) {
        try {
            TarjetaResponse response = asignarTarjetaUseCase.execute(request);
            return Response.ok(response).build();
        } catch (BusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(ex.getMessage()))
                .build();
        } catch (Exception ex) {
            return Response.serverError()
                .entity(new ErrorResponse("Error inesperado al asignar la tarjeta"))
                .build();
        }
    }

    @DELETE
    @Path("/{idTarjeta}")
    @RolesAllowed({"admin", "administrador"})
    @Operation(
        summary = "Eliminar tarjeta",
        description = "Elimina una tarjeta corporativa del sistema"
    )
    @APIResponses(value = {
        @APIResponse(responseCode = "204", description = "Tarjeta eliminada exitosamente"),
        @APIResponse(responseCode = "400", description = "Validación de negocio fallida"),
        @APIResponse(responseCode = "404", description = "Tarjeta no encontrada")
    })
    public Response eliminar(@PathParam("idTarjeta") Long idTarjeta) {
        try {
            eliminarTarjetaUseCase.execute(idTarjeta);
            return Response.noContent().build();
        } catch (BusinessException ex) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(ex.getMessage()))
                .build();
        } catch (Exception ex) {
            return Response.serverError()
                .entity(new ErrorResponse("Error inesperado al eliminar la tarjeta"))
                .build();
        }
    }

    public record ErrorResponse(String message) {
    }
}
