package datum.travels.application.usecase.tarjeta;

import datum.travels.application.dto.tarjeta.TarjetaResponse;
import datum.travels.domain.model.Empleado;
import datum.travels.domain.model.Tarjeta;
import datum.travels.domain.model.Usuario;
import datum.travels.domain.repository.TarjetaRepository;
import datum.travels.domain.repository.UsuarioRepository;
import datum.travels.shared.exception.BusinessException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;

/**
 * Caso de uso para obtener las tarjetas asignadas a un empleado específico.
 * El empleado se identifica mediante el token JWT del usuario autenticado.
 */
@ApplicationScoped
public class ObtenerTarjetasEmpleadoUseCase {

    @Inject
    TarjetaRepository tarjetaRepository;

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    JsonWebToken jwt;

    /**
     * Obtiene todas las tarjetas asignadas al empleado autenticado.
     *
     * @return Lista de tarjetas del empleado
     * @throws BusinessException si el empleado no existe
     */
    public List<TarjetaResponse> execute() {
        // Obtener el keycloakId del token JWT
        String keycloakId = jwt.getSubject();

        if (keycloakId == null || keycloakId.isBlank()) {
            throw new BusinessException("No se pudo identificar al usuario autenticado");
        }

        // Buscar usuario por keycloakId
        Usuario usuario = usuarioRepository.findByKeycloakId(keycloakId)
            .orElseThrow(() -> new BusinessException("Usuario no encontrado para el keycloak_id: " + keycloakId));

        // Verificar que el usuario tiene un empleado asociado
        if (usuario.getIdEmpleado() == null) {
            throw new BusinessException("El usuario no tiene un empleado asociado");
        }

        // Obtener tarjetas del empleado
        List<Tarjeta> tarjetas = tarjetaRepository.buscarPorEmpleado(usuario.getIdEmpleado());

        // Mapear a DTOs
        return tarjetas.stream()
            .map(this::mapToResponse)
            .toList();
    }

    private TarjetaResponse mapToResponse(Tarjeta tarjeta) {
        TarjetaResponse.EmpleadoTarjetaDTO empleadoDTO = null;

        if (tarjeta.empleado != null) {
            Empleado emp = tarjeta.empleado;
            empleadoDTO = new TarjetaResponse.EmpleadoTarjetaDTO(
                emp.getIdEmpleado(),
                emp.getNombre(),
                emp.getApellido(),
                emp.getCorreo()
            );
        }

        String nombrePais = tarjeta.pais != null ? tarjeta.pais.nombrePais : null;
        Long idPais = tarjeta.pais != null ? tarjeta.pais.idPais : null;

        return new TarjetaResponse(
            tarjeta.idTarjeta,
            tarjeta.banco,
            tarjeta.numeroTarjeta,
            tarjeta.fechaExpiracion,
            idPais,
            nombrePais,
            empleadoDTO
        );
    }
}
