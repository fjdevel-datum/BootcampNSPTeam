package datum.travels.application.usecase.empleado;

import datum.travels.application.dto.empleado.CrearEmpleadoRequest;
import datum.travels.application.dto.empleado.EmpleadoCreadoResponse;
import datum.travels.domain.model.Empleado;
import datum.travels.domain.model.Usuario;
import datum.travels.domain.repository.EmpleadoRepository;
import datum.travels.domain.repository.UsuarioRepository;
import datum.travels.infrastructure.adapter.external.KeycloakAdminClient;
import datum.travels.shared.exception.BusinessException;
import datum.travels.shared.util.PasswordHashUtil;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

/**
 * Caso de uso para crear un empleado junto con su usuario en Keycloak.
 */
@ApplicationScoped
public class CrearEmpleadoConUsuarioUseCase {

    private static final Logger LOG = Logger.getLogger(CrearEmpleadoConUsuarioUseCase.class);

    @Inject
    EmpleadoRepository empleadoRepository;

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    KeycloakAdminClient keycloakAdminClient;

    /**
     * Ejecuta la creación del empleado y su usuario asociado.
     *
     * @param request datos de entrada
     * @return respuesta con la información creada
     */
    @Transactional
    public EmpleadoCreadoResponse execute(CrearEmpleadoRequest request) {
        validar(request);

        String keycloakId = keycloakAdminClient.createUser(
            request.usuario(),
            request.contrasena(),
            request.nombre(),
            request.apellido(),
            request.correo()
        );

        try {
            Empleado empleado = construirEmpleado(request);
            empleadoRepository.save(empleado);

            Usuario usuario = construirUsuario(request, empleado.getIdEmpleado(), keycloakId);
            usuarioRepository.persist(usuario);

            return new EmpleadoCreadoResponse(
                empleado.getIdEmpleado(),
                empleado.getIdDepartamento(),
                empleado.getIdCargo(),
                empleado.getIdEmpresa(),
                empleado.getNombre(),
                empleado.getApellido(),
                empleado.getCorreo(),
                empleado.getTelefono(),
                usuario.getUsuarioApp(),
                keycloakId
            );
        } catch (RuntimeException ex) {
            LOG.warnf(ex, "Error al persistir empleado/usuario, revirtiendo usuario en Keycloak");
            keycloakAdminClient.deleteUser(keycloakId);
            throw ex;
        }
    }

    private void validar(CrearEmpleadoRequest request) {
        usuarioRepository.findByUsuarioApp(request.usuario())
            .ifPresent(usuario -> {
                throw new BusinessException("El nombre de usuario ya está registrado");
            });

        empleadoRepository.findByCorreo(request.correo())
            .ifPresent(empleado -> {
                throw new BusinessException("El correo del empleado ya está registrado");
            });
    }

    private Empleado construirEmpleado(CrearEmpleadoRequest request) {
        Empleado empleado = new Empleado();
        empleado.setIdDepartamento(request.idDepartamento());
        empleado.setIdCargo(request.idCargo());
        empleado.setIdEmpresa(request.idEmpresa());
        empleado.setNombre(request.nombre());
        empleado.setApellido(request.apellido());
        empleado.setCorreo(request.correo());
        empleado.setTelefono(request.telefono());
        return empleado;
    }

    private Usuario construirUsuario(CrearEmpleadoRequest request, Long idEmpleado, String keycloakId) {
        Usuario usuario = new Usuario();
        usuario.setIdEmpleado(idEmpleado);
        usuario.setUsuarioApp(request.usuario());
        usuario.setContrasena(PasswordHashUtil.hashToBase64(request.contrasena()));
        usuario.setKeycloakId(keycloakId);
        return usuario;
    }
}
