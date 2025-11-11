package datum.travels.application.usecase.empleado;

import datum.travels.application.dto.empleado.UsuarioAdminResponse;
import datum.travels.domain.model.Empleado;
import datum.travels.domain.model.Usuario;
import datum.travels.domain.repository.TarjetaRepository;
import datum.travels.domain.repository.UsuarioRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Caso de uso para listar usuarios disponibles para el panel de administración.
 */
@ApplicationScoped
@Transactional(Transactional.TxType.SUPPORTS)
public class ListarUsuariosAdminUseCase {

    @Inject
    UsuarioRepository usuarioRepository;
    @Inject
    TarjetaRepository tarjetaRepository;

    public List<UsuarioAdminResponse> execute() {
        List<Usuario> usuarios = usuarioRepository.findAllUsuarios();

        List<Long> idsEmpleado = usuarios.stream()
            .map(Usuario::getIdEmpleado)
            .filter(Objects::nonNull)
            .distinct()
            .collect(Collectors.toList());

        Map<Long, Long> tarjetasPorEmpleado = tarjetaRepository.countByEmpleadoIds(idsEmpleado);

        return usuarios.stream()
            .map(usuario -> mapToResponse(usuario, tarjetasPorEmpleado))
            .collect(Collectors.toList());
    }

    private UsuarioAdminResponse mapToResponse(Usuario usuario, Map<Long, Long> tarjetasPorEmpleado) {
        Empleado empleado = usuario.getEmpleado();

        Long idEmpleado = empleado != null ? empleado.getIdEmpleado() : null;
        String nombre = empleado != null ? empleado.getNombre() : null;
        String apellido = empleado != null ? empleado.getApellido() : null;
        String correo = empleado != null ? empleado.getCorreo() : null;
        String telefono = empleado != null ? empleado.getTelefono() : null;

        String cargo = null;
        if (empleado != null && empleado.getCargo() != null) {
            cargo = empleado.getCargo().nombre;
        }

        String departamento = null;
        if (empleado != null && empleado.getDepartamento() != null) {
            departamento = empleado.getDepartamento().nombreDepart;
        }

        String empresa = null;
        if (empleado != null && empleado.getEmpresa() != null) {
            empresa = empleado.getEmpresa().nombreEmpresa;
        }

        int totalTarjetas = 0;
        if (idEmpleado != null) {
            totalTarjetas = tarjetasPorEmpleado.getOrDefault(idEmpleado, 0L).intValue();
        }

        return new UsuarioAdminResponse(
            usuario.getIdUsuario(),
            idEmpleado,
            usuario.getUsuarioApp(),
            correo,
            nombre,
            apellido,
            telefono,
            cargo,
            departamento,
            empresa,
            totalTarjetas
        );
    }
}
