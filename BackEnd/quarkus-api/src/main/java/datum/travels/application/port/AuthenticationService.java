package datum.travels.application.port;

/**
 * Puerto para servicios de autenticación
 * 
 * Define el contrato que debe cumplir cualquier implementación
 * de autenticación (Keycloak, JWT simple, Auth0, etc.)
 * 
 * La implementación real estará en:
 * infrastructure/adapter/security/KeycloakAuthAdapter.java
 */
public interface AuthenticationService {
    
    /**
     * Autentica un usuario con sus credenciales
     * 
     * @param username Nombre de usuario
     * @param password Contraseña
     * @return Token JWT si la autenticación es exitosa
     * @throws AuthenticationException si las credenciales son inválidas
     */
    String autenticar(String username, String password);
    
    /**
     * Valida si un token JWT es válido
     * 
     * @param token Token JWT a validar
     * @return true si el token es válido, false en caso contrario
     */
    boolean validarToken(String token);
    
    /**
     * Obtiene el username desde un token JWT
     * 
     * @param token Token JWT
     * @return Username del usuario autenticado
     * @throws AuthenticationException si el token es inválido
     */
    String obtenerUsernameDesdeToken(String token);
    
    /**
     * Refresca un token JWT
     * 
     * @param refreshToken Token de refresco
     * @return Nuevo token JWT
     * @throws AuthenticationException si el refresh token es inválido
     */
    String refrescarToken(String refreshToken);
    
    /**
     * Cierra la sesión de un usuario (invalida el token)
     * 
     * @param token Token JWT a invalidar
     */
    void cerrarSesion(String token);
    
    /**
     * Obtiene información adicional del token (claims)
     * Útil para extraer roles, permisos, etc.
     * 
     * @param token Token JWT
     * @return Mapa con los claims del token
     */
    java.util.Map<String, Object> obtenerClaimsDelToken(String token);
}