package datum.travels.application.usecase.auth;

import datum.travels.application.dto.auth.ValidateTokenResponse;
import datum.travels.shared.security.JwtService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Caso de Uso: Validar Token JWT
 * 
 * Responsabilidades:
 * 1. Validar que el token es válido y no está expirado
 * 2. Extraer información del usuario del token
 * 3. Retornar respuesta con estado de validez
 */
@ApplicationScoped
public class ValidateTokenUseCase {

    @Inject
    JwtService jwtService;

    /**
     * Valida un token JWT
     *
     * @param token JWT a validar
     * @return ValidateTokenResponse con el resultado de la validación
     */
    public ValidateTokenResponse execute(String token) {
        
        // Limpiar el token (remover "Bearer " si viene)
        String cleanToken = token.startsWith("Bearer ") 
                ? token.substring(7) 
                : token;

        // Validar token
        if (!jwtService.validateToken(cleanToken)) {
            return ValidateTokenResponse.invalid("Token inválido o expirado");
        }

        try {
            // Extraer información del usuario
            Long idUsuario = jwtService.extractIdUsuario(cleanToken);
            String usuarioApp = jwtService.extractUsuarioApp(cleanToken);

            return ValidateTokenResponse.valid(idUsuario, usuarioApp);
            
        } catch (Exception e) {
            return ValidateTokenResponse.invalid("Error al procesar el token");
        }
    }
}
