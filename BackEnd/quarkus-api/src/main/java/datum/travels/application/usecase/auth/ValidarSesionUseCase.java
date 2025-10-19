package datum.travels.application.usecase.auth;

import datum.travels.application.dto.auth.SesionActivaDTO;

/**
 * Caso de uso: Validar sesión activa
 * 
 * Este Use Case permite:
 * 1. Validar que un token JWT sea válido
 * 2. Verificar que no haya expirado
 * 3. Extraer información del usuario desde el token
 * 4. Retornar datos de la sesión activa
 * 
 * Se usa en:
 * - Interceptores/Filters para validar peticiones protegidas
 * - Endpoints de verificación de sesión
 * - Refrescar datos del usuario en el frontend
 * 
 * @author Equipo Datum Travels
 * @version 1.0
 */
public interface ValidarSesionUseCase {
    
    /**
     * Valida un token JWT y retorna información de la sesión
     * 
     * @param token Token JWT a validar (sin "Bearer ")
     * @return SesionActivaDTO con datos del usuario y validez del token
     * @throws AuthenticationException si el token es inválido o expirado
     */
    SesionActivaDTO ejecutar(String token);
    
    /**
     * Valida solo si el token es válido (sin extraer datos)
     * Útil para checks rápidos
     * 
     * @param token Token JWT a validar
     * @return true si el token es válido, false en caso contrario
     */
    boolean esTokenValido(String token);
}