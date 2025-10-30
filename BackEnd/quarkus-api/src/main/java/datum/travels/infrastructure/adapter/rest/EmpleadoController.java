package datum.travels.infrastructure.adapter.rest;

import datum.travels.application.dto.empleado.CrearEmpleadoRequest;
import datum.travels.application.dto.empleado.EmpleadoCreadoResponse;
import datum.travels.application.dto.empleado.UsuarioAdminResponse;
import datum.travels.application.usecase.empleado.CrearEmpleadoConUsuarioUseCase;
import datum.travels.application.usecase.empleado.ListarUsuariosAdminUseCase;
import datum.travels.shared.exception.BusinessException;
import datum.travels.shared.exception.KeycloakIntegrationException;
import io.quarkus.security.Authenticated;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
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
 * Endpoints de gestión de empleados.
 */
@Path("/api/empleados")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Empleados", description = "Gestión de empleados y usuarios")
@Authenticated
public class EmpleadoController {

    @Inject
    CrearEmpleadoConUsuarioUseCase crearEmpleadoConUsuarioUseCase;

    @Inject
    ListarUsuariosAdminUseCase listarUsuariosAdminUseCase;

    @GET
    @RolesAllowed({"admin", "administrador"})
    @Operation(summary = "Listar empleados", description = "Obtiene todos los empleados registrados")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Listado de empleados", content = @Content(
            schema = @Schema(implementation = UsuarioAdminResponse.class)
        ))
    })
    public Response listar() {
        List<UsuarioAdminResponse> usuarios = listarUsuariosAdminUseCase.execute();
        return Response.ok(usuarios).build();
    }

    @POST
    @RolesAllowed({"admin", "administrador"})
    @Operation(
        summary = "Crear empleado",
        description = "Registra un nuevo empleado y crea su usuario en Keycloak con rol por defecto 'usuario'"
    )
    @APIResponses(value = {
        @APIResponse(responseCode = "201", description = "Empleado creado", content = @Content(
            schema = @Schema(implementation = EmpleadoCreadoResponse.class)
        )),
        @APIResponse(responseCode = "400", description = "Validación de negocio fallida"),
        @APIResponse(responseCode = "502", description = "Error al comunicarse con Keycloak")
    })
    public Response crear(@Valid CrearEmpleadoRequest request) {
        try {
            EmpleadoCreadoResponse response = crearEmpleadoConUsuarioUseCase.execute(request);
            return Response.status(Response.Status.CREATED).entity(response).build();
        } catch (BusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(ex.getMessage()))
                .build();
        } catch (KeycloakIntegrationException ex) {
            return Response.status(Response.Status.BAD_GATEWAY)
                .entity(new ErrorResponse(ex.getMessage()))
                .build();
        } catch (WebApplicationException ex) {
            throw ex;
        } catch (Exception ex) {
            return Response.serverError()
                .entity(new ErrorResponse("Error inesperado al crear el empleado"))
                .build();
        }
    }

    public record ErrorResponse(String message) {
    }
}
