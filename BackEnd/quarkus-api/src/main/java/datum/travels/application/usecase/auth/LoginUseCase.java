package datum.travels.application.usecase.auth;

import datum.travels.application.dto.auth.LoginRequest;
import datum.travels.application.dto.auth.LoginResponse;
import datum.travels.domain.exception.AuthenticationException;
import datum.travels.domain.model.Empleado;
import datum.travels.domain.model.Usuario;
import datum.travels.domain.repository.UsuarioRepository;
import datum.travels.shared.security.JwtService;
import datum.travels.shared.security.PasswordHasher;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

/**
 * Caso de Uso: Login de Usuario
 * 
 * Responsabilidades:
 * 1. Validar que el usuario existe
 * 2. Verificar la contraseña
 * 3. Generar JWT
 * 4. Retornar información del usuario logueado
 */
@ApplicationScoped
public class LoginUseCase {

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    JwtService jwtService;

    @Inject
    PasswordHasher passwordHasher;

    /**
     * Ejecuta el login del usuario
     *
     * @param request Credenciales del usuario
     * @return LoginResponse con el token y datos del usuario
     * @throws AuthenticationException si las credenciales son inválidas
     */
    @Transactional
    public LoginResponse execute(LoginRequest request) {
        
        // 1. Buscar usuario por nombre de usuario
        Usuario usuario = usuarioRepository
                .findByUsuarioApp(request.usuarioApp())
                .orElseThrow(() -> new AuthenticationException("Credenciales inválidas"));

        // 2. Verificar contraseña
        if (!passwordHasher.verify(request.contrasena(), usuario.getContrasena())) {
            throw new AuthenticationException("Credenciales inválidas");
        }

        // 3. Generar JWT
        String token = jwtService.generateToken(
                usuario.getIdUsuario(),
                usuario.getUsuarioApp()
        );

        // 4. Obtener información del empleado relacionado
        Empleado empleado = usuario.getEmpleado();
        
        // 5. Construir respuesta
        LoginResponse.UsuarioInfo usuarioInfo = new LoginResponse.UsuarioInfo(
                usuario.getIdUsuario(),
                empleado != null ? empleado.getIdEmpleado() : null,
                usuario.getUsuarioApp(),
                empleado != null ? empleado.getNombreCompleto() : "Sin nombre",
                empleado != null ? empleado.getCorreo() : null
        );

        return LoginResponse.of(
                token,
                jwtService.getExpirationTime(),
                usuarioInfo
        );
    }
}
