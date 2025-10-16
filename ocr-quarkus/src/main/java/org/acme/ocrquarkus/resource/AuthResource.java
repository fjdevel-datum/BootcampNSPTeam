package org.acme.ocrquarkus.resource;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.ocrquarkus.dto.LoginRequest;
import org.acme.ocrquarkus.entity.Usuario;
import org.acme.ocrquarkus.repository.UsuarioRepository;

import java.util.HashMap;
import java.util.Map;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    UsuarioRepository usuarioRepository;

    @POST
    @Path("/login")
    @Transactional
    public Response login(LoginRequest request) {
        if (request == null || request.nombreUsuario == null || request.contrasena == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(message("Datos de login incompletos"))
                    .build();
        }

        return usuarioRepository.findByNombreUsuario(request.nombreUsuario)
                .map(u -> verifyPassword(u, request.contrasena)
                        ? Response.ok(message("LOGIN_OK")).build()
                        : Response.status(Response.Status.UNAUTHORIZED).entity(message("CREDENCIALES_INVALIDAS")).build())
                .orElseGet(() -> Response.status(Response.Status.UNAUTHORIZED).entity(message("USUARIO_NO_ENCONTRADO")).build());
    }

    private boolean verifyPassword(Usuario u, String raw) {
        // Nota: contrasena en texto plano segun requisito
        return u.getContrasena() != null && u.getContrasena().equals(raw);
    }

    private Map<String, Object> message(String msg) {
        Map<String, Object> m = new HashMap<>();
        m.put("message", msg);
        return m;
    }
}

