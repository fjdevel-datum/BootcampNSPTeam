package datum.travels.application.usecase.auth;

import datum.travels.application.dto.auth.LoginRequest;
import datum.travels.application.dto.auth.LoginResponse;
import datum.travels.domain.exception.AuthenticationException;
import datum.travels.domain.model.Empleado;
import datum.travels.domain.model.Usuario;
import datum.travels.domain.repository.UsuarioRepository;
import datum.travels.infrastructure.adapter.keycloak.KeycloakAuthenticationService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

/**
 * Caso de Uso: Login de Usuario con Keycloak
 * 
 * Responsabilidades:
 * 1. Validar que el usuario existe en BD local (para obtener datos del empleado)
 * 2. Autenticar con Keycloak (delega la verificación de contraseña)
 * 3. Obtener JWT firmado por Keycloak
 * 4. Retornar información del usuario logueado con token de Keycloak
 * 
 * CAMBIOS respecto a versión anterior:
 * - ❌ Ya NO genera JWT localmente (lo hace Keycloak)
 * - ❌ Ya NO verifica contraseña con BCrypt (lo hace Keycloak)
 * - ✅ Obtiene JWT firmado por Keycloak con RS256
 * - ✅ Token incluye roles de Keycloak automáticamente
 */
@ApplicationScoped
public class LoginUseCase {

    private static final Logger LOG = Logger.getLogger(LoginUseCase.class);

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    KeycloakAuthenticationService keycloakAuthService;

    /**
     * Ejecuta el login del usuario con autenticación Keycloak
     *
     * @param request Credenciales del usuario
     * @return LoginResponse con el token JWT de Keycloak y datos del usuario
     * @throws AuthenticationException si las credenciales son inválidas
     */
    @Transactional
    public LoginResponse execute(LoginRequest request) {
        LOG.infof("🔐 Iniciando login para usuario: %s", request.usuarioApp());
        
        // 1. Buscar usuario en BD local (para obtener datos del empleado)
        //    El usuario debe existir tanto en Keycloak como en nuestra BD
        Usuario usuario = usuarioRepository
                .findByUsuarioApp(request.usuarioApp())
                .orElseThrow(() -> {
                    LOG.warnf("❌ Usuario no encontrado en BD local: %s", request.usuarioApp());
                    return new AuthenticationException("Credenciales inválidas");
                });

        LOG.debugf("✅ Usuario encontrado en BD: ID=%d, IdEmpleado=%d", 
            usuario.getIdUsuario(),
            usuario.getEmpleado() != null ? usuario.getEmpleado().getIdEmpleado() : null);

        // 2. Autenticar con Keycloak (obtiene JWT firmado)
        //    Keycloak valida la contraseña y genera el token
        String jwtToken;
        try {
            LOG.debugf("🔑 Autenticando con Keycloak...");
            
            jwtToken = keycloakAuthService.authenticate(
                request.usuarioApp(),
                request.contrasena()
            );
            
            LOG.infof("✅ Autenticación exitosa en Keycloak para usuario: %s", request.usuarioApp());
            
        } catch (AuthenticationException e) {
            LOG.warnf("❌ Fallo de autenticación en Keycloak para usuario: %s - %s", 
                request.usuarioApp(), e.getMessage());
            throw e;
        }

        // 3. Obtener información del empleado relacionado
        Empleado empleado = usuario.getEmpleado();
        
        if (empleado != null) {
            LOG.debugf("👤 Empleado asociado: ID=%d, Nombre=%s, Correo=%s", 
                empleado.getIdEmpleado(),
                empleado.getNombreCompleto(),
                empleado.getCorreo());
        } else {
            LOG.warnf("⚠️  Usuario '%s' no tiene empleado asociado", request.usuarioApp());
        }

        // 4. Construir respuesta con token de Keycloak
        LoginResponse.UsuarioInfo usuarioInfo = new LoginResponse.UsuarioInfo(
                usuario.getIdUsuario(),
                empleado != null ? empleado.getIdEmpleado() : null,
                usuario.getUsuarioApp(),
                empleado != null ? empleado.getNombreCompleto() : "Sin nombre",
                empleado != null ? empleado.getCorreo() : null
        );

        LOG.infof("🎉 Login completado exitosamente para usuario: %s", request.usuarioApp());

        // Token de Keycloak expira en 300 segundos (5 minutos) por configuración del realm
        return LoginResponse.of(
                jwtToken,      // ✅ Token JWT de Keycloak (no generado localmente)
                300L,          // Expiración configurada en Keycloak
                usuarioInfo
        );
    }
}
