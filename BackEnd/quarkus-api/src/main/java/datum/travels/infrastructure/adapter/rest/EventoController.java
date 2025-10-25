package datum.travels.infrastructure.adapter.rest;

import datum.travels.application.dto.evento.ActualizarEstadoRequest;
import datum.travels.application.dto.evento.CrearEventoRequest;
import datum.travels.application.dto.evento.EventoResponse;
import datum.travels.application.usecase.evento.ActualizarEstadoEventoUseCase;
import datum.travels.application.usecase.evento.CrearEventoUseCase;
import datum.travels.application.usecase.evento.ListarEventosUseCase;
import datum.travels.application.usecase.evento.ObtenerDetalleEventoUseCase;
import datum.travels.domain.exception.ResourceNotFoundException;
import datum.travels.shared.constant.AuthSimulation;
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
 * Controlador REST para endpoints de eventos
 * 
 * Endpoints:
 * - GET /api/eventos → Listar eventos del empleado
 * - POST /api/eventos → Crear nuevo evento
 * - GET /api/eventos/{id} → Obtener detalle de evento
 * - PATCH /api/eventos/{id}/estado → Actualizar estado del evento
 * 
 * 🔐 PROTECCIÓN CON KEYCLOAK:
 * - Todos los endpoints requieren autenticación (token JWT de Keycloak)
 * - Algunos endpoints requieren roles específicos (@RolesAllowed)
 */
@Path("/api/eventos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Eventos", description = "Gestión de eventos de viaje")
public class EventoController {

    @Inject
    ListarEventosUseCase listarEventosUseCase;

    @Inject
    CrearEventoUseCase crearEventoUseCase;

    @Inject
    ObtenerDetalleEventoUseCase obtenerDetalleEventoUseCase;

    @Inject
    ActualizarEstadoEventoUseCase actualizarEstadoEventoUseCase;

    /**
     * GET /api/eventos?idEmpleado={id}
     * Lista todos los eventos de un empleado
     * 
     * 🔐 Requiere: Token JWT válido de Keycloak
     * 👥 Roles permitidos: empleado, gerente, admin
     * 
     * ⚠️ SIMULACIÓN: Si no se proporciona idEmpleado, usa AuthSimulation.ID_EMPLEADO_SIMULADO
     * Cambiar el valor en: shared/constant/AuthSimulation.java
     */
    @GET
    @RolesAllowed({"empleado", "gerente", "admin"})
    @Operation(summary = "Listar eventos", description = "Obtiene todos los eventos de un empleado")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Lista de eventos obtenida exitosamente",
                    content = @Content(schema = @Schema(implementation = EventoResponse.class))),
            @APIResponse(responseCode = "401", description = "No autenticado"),
            @APIResponse(responseCode = "403", description = "Sin permisos")
    })
    public Response listarEventos(
            @QueryParam("idEmpleado") Long idEmpleado
    ) {
        // Si no se proporciona idEmpleado, usa el valor simulado
        Long empleadoId = (idEmpleado != null) ? idEmpleado : AuthSimulation.ID_EMPLEADO_SIMULADO;

        List<EventoResponse> eventos = listarEventosUseCase.execute(empleadoId);
        return Response.ok(eventos).build();
    }

    /**
     * POST /api/eventos
     * Crea un nuevo evento
     * 
     * 🔐 Requiere: Token JWT válido de Keycloak
     * 👥 Roles permitidos: empleado, admin
     */
    @POST
    @RolesAllowed({"empleado", "admin"})
    @Operation(summary = "Crear evento", description = "Crea un nuevo evento de viaje o gasto de representación")
    @APIResponses(value = {
            @APIResponse(responseCode = "201", description = "Evento creado exitosamente",
                    content = @Content(schema = @Schema(implementation = EventoResponse.class))),
            @APIResponse(responseCode = "400", description = "Datos inválidos")
    })
    public Response crearEvento(@Valid CrearEventoRequest request) {
        EventoResponse evento = crearEventoUseCase.execute(request);
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

    // ═══════════════════════════════════════════════════════════════════════
    // DTOs Auxiliares
    // ═══════════════════════════════════════════════════════════════════════

    public record ErrorResponse(String message) {
    }
}
