package datum.travels.application.usecase.auth;

import datum.travels.application.dto.auth.LoginRequestDTO;
import datum.travels.application.dto.auth.LoginResponseDTO;

/**
 * Caso de uso: Autenticar un usuario
 * 
 * Este Use Case orquesta el proceso de login:
 * 1. Valida las credenciales recibidas
 * 2. Delega la autenticación al puerto AuthenticationService
 * 3. Retorna un DTO con el token JWT y datos del usuario
 * 
 * @author Equipo Datum Travels
 * @version 1.0
 */
public interface LoginUseCase {
    
    /**
     * Ejecuta el proceso de autenticación
     * 
     * @param loginRequest DTO con username y password
     * @return LoginResponseDTO con token JWT y datos del usuario
     * @throws AuthenticationException si las credenciales son inválidas
     * @throws BusinessValidationException si los datos están incompletos
     */
    LoginResponseDTO ejecutar(LoginRequestDTO loginRequest);
}