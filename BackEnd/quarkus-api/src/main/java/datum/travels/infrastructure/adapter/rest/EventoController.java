package datum.travels.infrastructure.adapter.rest;

import datum.travels.application.dto.evento.ActualizarEstadoRequest;
import datum.travels.application.dto.evento.CrearEventoRequest;
import datum.travels.application.dto.evento.EventoResponse;
import datum.travels.application.usecase.evento.ActualizarEstadoEventoUseCase;
import datum.travels.application.usecase.evento.CrearEventoUseCase;
import datum.travels.application.usecase.evento.EliminarEventoUseCase;
import datum.travels.application.usecase.evento.ListarEventosUseCase;
import datum.travels.application.usecase.evento.ObtenerDetalleEventoUseCase;
import datum.travels.domain.exception.ResourceNotFoundException;
import datum.travels.shared.util.CurrentUserProvider;
import io.quarkus.security.Authenticated;
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
 * Controlador REST para endpoints de eventos
 * 
 * Endpoints:
 * - GET /api/eventos → Listar eventos del empleado
 * - POST /api/eventos → Crear nuevo evento
 * - GET /api/eventos/{id} → Obtener detalle de evento
 * - PATCH /api/eventos/{id}/estado → Actualizar estado del evento
 */
@Path("/api/eventos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Eventos", description = "Gestión de eventos de viaje")
@Authenticated // 🔐 Requiere JWT válido de Keycloak
public class EventoController {

    @Inject
    ListarEventosUseCase listarEventosUseCase;

    @Inject
    CrearEventoUseCase crearEventoUseCase;

    @Inject
    ObtenerDetalleEventoUseCase obtenerDetalleEventoUseCase;

    @Inject
    ActualizarEstadoEventoUseCase actualizarEstadoEventoUseCase;

    @Inject
    EliminarEventoUseCase eliminarEventoUseCase;

    @Inject
    CurrentUserProvider currentUserProvider;

    /**
     * GET /api/eventos
     * Lista todos los eventos del empleado autenticado
     * 
     * ✅ INTEGRACIÓN KEYCLOAK: 
     * - Ya no usa AuthSimulation
     * - Obtiene automáticamente el idEmpleado del JWT
     * - Solo retorna eventos del usuario logueado
     */
    @GET
    @Operation(summary = "Listar mis eventos", description = "Obtiene todos los eventos del empleado autenticado")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Lista de eventos obtenida exitosamente",
                    content = @Content(schema = @Schema(implementation = EventoResponse.class))),
            @APIResponse(responseCode = "403", description = "Usuario no vinculado a un empleado")
    })
    public Response listarEventos() {
        // Obtiene automáticamente el ID del empleado desde el JWT
        Long idEmpleado = currentUserProvider.getIdEmpleado()
            .orElseThrow(() -> new WebApplicationException(
                "Usuario no vinculado a un empleado. Contacte al administrador.", 
                Response.Status.FORBIDDEN
            ));

        List<EventoResponse> eventos = listarEventosUseCase.execute(idEmpleado);
        return Response.ok(eventos).build();
    }

    /**
     * POST /api/eventos
     * Crea un nuevo evento para el empleado autenticado
     * 
     * ✅ INTEGRACIÓN KEYCLOAK: 
     * - Fuerza que el evento sea del empleado autenticado
     * - Ignora cualquier idEmpleado que venga en el request
     */
    @POST
    @Operation(summary = "Crear evento", description = "Crea un nuevo evento de viaje o gasto de representación")
    @APIResponses(value = {
            @APIResponse(responseCode = "201", description = "Evento creado exitosamente",
                    content = @Content(schema = @Schema(implementation = EventoResponse.class))),
            @APIResponse(responseCode = "400", description = "Datos inválidos"),
            @APIResponse(responseCode = "403", description = "Usuario no vinculado a un empleado")
    })
    public Response crearEvento(@Valid CrearEventoRequest request) {
        // Obtiene el ID del empleado autenticado
        Long idEmpleado = currentUserProvider.getIdEmpleado()
            .orElseThrow(() -> new WebApplicationException(
                "Usuario no vinculado a un empleado. Contacte al administrador.", 
                Response.Status.FORBIDDEN
            ));

        // Crea un nuevo request forzando el idEmpleado del usuario autenticado
        CrearEventoRequest requestConEmpleado = new CrearEventoRequest(
            request.nombreEvento(),
            idEmpleado  // 🔐 Forzamos el ID del empleado autenticado
        );

        EventoResponse evento = crearEventoUseCase.execute(requestConEmpleado);
        return Response.status(Response.Status.CREATED).entity(evento).build();
    }

    /**
     * GET /api/eventos/{id}
     * Obtiene el detalle de un evento específico
     */
    @GET
    @Path("/{id}")
    @Operation(summary = "Obtener evento", description = "Obtiene los detalles completos de un evento por su ID")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Evento encontrado",
                    content = @Content(schema = @Schema(implementation = EventoResponse.class))),
            @APIResponse(responseCode = "404", description = "Evento no encontrado")
    })
    public Response obtenerEvento(@PathParam("id") Long idEvento) {
        try {
            EventoResponse evento = obtenerDetalleEventoUseCase.execute(idEvento);
            return Response.ok(evento).build();
        } catch (ResourceNotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }

    /**
     * PATCH /api/eventos/{id}/estado
     * Actualiza el estado de un evento
     */
    @PATCH
    @Path("/{id}/estado")
    @Operation(summary = "Actualizar estado", description = "Cambia el estado de un evento (activo → completado/cancelado)")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Estado actualizado exitosamente",
                    content = @Content(schema = @Schema(implementation = EventoResponse.class))),
            @APIResponse(responseCode = "404", description = "Evento no encontrado"),
            @APIResponse(responseCode = "400", description = "Estado inválido")
    })
    public Response actualizarEstado(
            @PathParam("id") Long idEvento,
            @Valid ActualizarEstadoRequest request
    ) {
        try {
            EventoResponse evento = actualizarEstadoEventoUseCase.execute(idEvento, request);
            return Response.ok(evento).build();
        } catch (ResourceNotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }

    /**
     * DELETE /api/eventos/{id}
     * Elimina un evento y todos sus gastos asociados
     */
    @DELETE
    @Path("/{id}")
    @Operation(summary = "Eliminar evento", description = "Elimina un evento y todos sus gastos asociados (CASCADE)")
    @APIResponses(value = {
            @APIResponse(responseCode = "204", description = "Evento eliminado exitosamente"),
            @APIResponse(responseCode = "404", description = "Evento no encontrado")
    })
    public Response eliminarEvento(@PathParam("id") Long idEvento) {
        try {
            eliminarEventoUseCase.execute(idEvento);
            return Response.noContent().build();
        } catch (ResourceNotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DTOs Auxiliares
    // ═══════════════════════════════════════════════════════════════════════

    public record ErrorResponse(String message) {
    }
}
