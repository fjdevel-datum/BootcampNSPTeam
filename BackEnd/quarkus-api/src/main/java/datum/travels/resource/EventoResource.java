package datum.travels.resource;

import datum.travels.dto.evento.CrearEventoDTO;
import datum.travels.dto.evento.EventoResumenDTO;
import datum.travels.dto.evento.EventoResponseDTO;
import datum.travels.service.EventoService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

/**
 * REST Resource para operaciones con Eventos
 * Base path: /api/eventos
 */
@Path("/api/eventos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EventoResource {

    @Inject
    EventoService eventoService;

    /**
     * GET /api/eventos/empleado/{idEmpleado}
     * Obtiene todos los eventos de un empleado
     */
    @GET
    @Path("/empleado/{idEmpleado}")
    public Response getEventosByEmpleado(@PathParam("idEmpleado") Long idEmpleado) {
        try {
            List<EventoResumenDTO> eventos = eventoService.getEventosByEmpleado(idEmpleado);
            return Response.ok(eventos).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener eventos: " + e.getMessage())
                    .build();
        }
    }

    /**
     * GET /api/eventos/empleado/{idEmpleado}/activos
     * Obtiene solo los eventos activos de un empleado
     */
    @GET
    @Path("/empleado/{idEmpleado}/activos")
    public Response getEventosActivos(@PathParam("idEmpleado") Long idEmpleado) {
        try {
            List<EventoResumenDTO> eventos = eventoService.getEventosActivosByEmpleado(idEmpleado);
            return Response.ok(eventos).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener eventos activos: " + e.getMessage())
                    .build();
        }
    }

    /**
     * POST /api/eventos
     * Crea un nuevo evento
     */
    @POST
    public Response crearEvento(@Valid CrearEventoDTO dto) {
        try {
            EventoResponseDTO response = eventoService.crearEvento(dto);

            if (response.isExitoso()) {
                return Response.status(Response.Status.CREATED).entity(response).build();
            } else {
                return Response.status(Response.Status.BAD_REQUEST).entity(response).build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(EventoResponseDTO.error("Error al crear evento: " + e.getMessage()))
                    .build();
        }
    }

    /**
     * GET /api/eventos/{id}
     * Obtiene un evento específico por su ID
     */
    @GET
    @Path("/{id}")
    public Response getEventoById(@PathParam("id") Long id) {
        try {
            EventoResumenDTO evento = eventoService.getEventoById(id);

            if (evento != null) {
                return Response.ok(evento).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Evento no encontrado")
                        .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener evento: " + e.getMessage())
                    .build();
        }
    }

    /**
     * PUT /api/eventos/{id}/estado
     * Cambia el estado de un evento
     */
    @PUT
    @Path("/{id}/estado")
    public Response cambiarEstado(@PathParam("id") Long id, @QueryParam("estado") String estado) {
        try {
            boolean actualizado = eventoService.cambiarEstadoEvento(id, estado);

            if (actualizado) {
                return Response.ok().entity("Estado actualizado correctamente").build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Evento no encontrado")
                        .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al cambiar estado: " + e.getMessage())
                    .build();
        }
    }
}