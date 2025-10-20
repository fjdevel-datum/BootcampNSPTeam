package datum.travels.infrastructure.adapter.rest;

import datum.travels.application.dto.auth.LoginRequest;
import datum.travels.application.dto.auth.LoginResponse;
import datum.travels.application.dto.auth.ValidateTokenResponse;
import datum.travels.application.usecase.auth.LoginUseCase;
import datum.travels.application.usecase.auth.ValidateTokenUseCase;
import datum.travels.domain.exception.AuthenticationException;
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

/**
 * Controlador REST para endpoints de autenticación
 * 
 * Endpoints:
 * - POST /api/auth/login → Login de usuario
 * - POST /api/auth/logout → Logout (client-side)
 * - GET /api/auth/validate → Validar token JWT
 */
@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Autenticación", description = "Endpoints para autenticación JWT")
public class AuthController {

    @Inject
    LoginUseCase loginUseCase;

    @Inject
    ValidateTokenUseCase validateTokenUseCase;

    /**
     * POST /api/auth/login
     * Autentica un usuario y genera un token JWT
     */
    @POST
    @Path("/login")
    @Operation(summary = "Login de usuario", description = "Valida credenciales y genera token JWT")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Login exitoso",
                    content = @Content(schema = @Schema(implementation = LoginResponse.class))),
            @APIResponse(responseCode = "401", description = "Credenciales inválidas"),
            @APIResponse(responseCode = "400", description = "Datos inválidos")
    })
    public Response login(@Valid LoginRequest request) {
        try {
            LoginResponse response = loginUseCase.execute(request);
            return Response.ok(response).build();
            
        } catch (AuthenticationException e) {
            return Response
                    .status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }

    /**
     * POST /api/auth/logout
     * Logout de usuario (client-side, solo documenta el endpoint)
     * El logout real se hace en el cliente borrando el token
     */
    @POST
    @Path("/logout")
    @Operation(summary = "Logout de usuario", description = "Cierra sesión del usuario (client-side)")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Logout exitoso")
    })
    public Response logout() {
        // En JWT stateless, el logout es client-side (borrar token del localStorage)
        // Este endpoint es solo para documentación/consistencia de API
        return Response.ok(new MessageResponse("Logout exitoso")).build();
    }

    /**
     * GET /api/auth/validate
     * Valida si un token JWT es válido
     */
    @GET
    @Path("/validate")
    @Operation(
            summary = "Validar token JWT", 
            description = "Verifica si un token JWT es válido y no ha expirado. Formato: 'Bearer <token>'"
    )
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Validación completada",
                    content = @Content(schema = @Schema(implementation = ValidateTokenResponse.class)))
    })
    public Response validateToken(
            @HeaderParam("Authorization") 
            @org.eclipse.microprofile.openapi.annotations.parameters.Parameter(
                    description = "Token JWT en formato: Bearer <token>",
                    required = true,
                    example = "Bearer eyJhbGciOiJIUzUxMiJ9..."
            )
            String authHeader
    ) {
        if (authHeader == null || authHeader.isEmpty()) {
            return Response.ok(ValidateTokenResponse.invalid("Token no proporcionado")).build();
        }

        ValidateTokenResponse response = validateTokenUseCase.execute(authHeader);
        return Response.ok(response).build();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DTOs Auxiliares
    // ═══════════════════════════════════════════════════════════════════════

    public record ErrorResponse(String message) {
    }

    public record MessageResponse(String message) {
    }
}
