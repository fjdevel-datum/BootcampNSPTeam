package datum.travels.application.port;

import java.util.Map;

/**
 * Puerto para el servicio de JWT
 * Define las operaciones necesarias para manejar tokens JWT
 */
public interface JwtService {

    /**
     * Genera un token JWT para un usuario
     * 
     * @param idUsuario ID del usuario
     * @param idEmpleado ID del empleado asociado
     * @param usuarioApp Nombre de usuario
     * @return Token JWT como String
     */
    String generateToken(Long idUsuario, Long idEmpleado, String usuarioApp);

    /**
     * Valida un token JWT
     * 
     * @param token Token a validar
     * @return true si el token es válido, false en caso contrario
     */
    boolean validateToken(String token);

    /**
     * Extrae los claims (datos) de un token JWT
     * 
     * @param token Token JWT
     * @return Map con los claims del token
     */
    Map<String, Object> getClaims(String token);

    /**
     * Extrae el ID del empleado de un token JWT
     * 
     * @param token Token JWT
     * @return ID del empleado
     */
    Long getIdEmpleado(String token);

    /**
     * Extrae el nombre de usuario de un token JWT
     * 
     * @param token Token JWT
     * @return Nombre de usuario
     */
    String getUsuarioApp(String token);

    /**
     * Verifica si un token ha expirado
     * 
     * @param token Token JWT
     * @return true si el token ha expirado, false en caso contrario
     */
    boolean isTokenExpired(String token);
}
