package datum.travels.infrastructure.adapter.rest;

import datum.travels.application.usecase.usuario.SincronizarUsuarioKeycloakUseCase;
import datum.travels.shared.util.CurrentUserProvider;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Endpoint para sincronizar usuario de Keycloak con BD local
 * Separado de AuthController para evitar conflictos de path
 */
@Path("/api/user")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    SincronizarUsuarioKeycloakUseCase sincronizarUsuarioUseCase;

    @Inject
    CurrentUserProvider currentUserProvider;

    /**
     * Endpoint que el frontend llama después del login exitoso
     * Vincula el keycloak_id con el usuario existente en BD
     */
    @POST
    @Path("/sync")
    @Authenticated
    public Response sincronizarUsuario() {
        String keycloakId = currentUserProvider.getKeycloakId();
        String username = currentUserProvider.getUsername();

        try {
            // Intenta vincular el keycloak_id al usuario existente
            var usuario = sincronizarUsuarioUseCase.vincularKeycloakId(username, keycloakId);
            
            return Response.ok()
                .entity(new SyncResponse(true, "Usuario sincronizado", usuario.getIdEmpleado()))
                .build();
                
        } catch (IllegalArgumentException e) {
            // Usuario no existe en BD local
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new SyncResponse(false, e.getMessage(), null))
                .build();
        }
    }

    /**
     * DTO de respuesta
     */
    public record SyncResponse(
        boolean success,
        String message,
        Long idEmpleado
    ) {}
}
