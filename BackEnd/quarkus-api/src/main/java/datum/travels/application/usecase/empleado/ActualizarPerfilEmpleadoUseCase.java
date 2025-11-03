package datum.travels.application.usecase.empleado;

import datum.travels.application.dto.empleado.ActualizarPerfilRequest;
import datum.travels.application.dto.empleado.PerfilEmpleadoResponse;
import datum.travels.domain.model.Empleado;
import datum.travels.domain.repository.EmpleadoRepository;
import datum.travels.shared.exception.BusinessException;
import datum.travels.domain.exception.ResourceNotFoundException;
import datum.travels.shared.util.CurrentUserProvider;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.Optional;

/**
 * Caso de Uso: Actualizar Perfil del Empleado Autenticado
 * 
 * Responsabilidades:
 * 1. Validar que el empleado existe
 * 2. Validar que el correo no esté en uso por otro empleado
 * 3. Actualizar datos básicos del empleado
 * 4. Retornar datos actualizados
 */
@ApplicationScoped
public class ActualizarPerfilEmpleadoUseCase {

    @Inject
    CurrentUserProvider currentUserProvider;

    @Inject
    EmpleadoRepository empleadoRepository;

    /**
     * Ejecuta el caso de uso para actualizar el perfil del empleado autenticado
     *
     * @param request datos a actualizar
     * @return PerfilEmpleadoResponse con datos actualizados
     * @throws ResourceNotFoundException si no se encuentra el empleado
     * @throws BusinessException si el correo ya está en uso
     */
    @Transactional
    public PerfilEmpleadoResponse execute(ActualizarPerfilRequest request) {
        // Obtener ID del empleado autenticado
        Long idEmpleado = currentUserProvider.getIdEmpleado()
            .orElseThrow(() -> new ResourceNotFoundException(
                "No se encontró un empleado asociado al usuario autenticado"
            ));

        // Buscar empleado actual
        Empleado empleado = empleadoRepository.buscarPorId(idEmpleado)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Empleado no encontrado con ID: " + idEmpleado
            ));

        // Validar que el correo no esté en uso por otro empleado
        if (!empleado.getCorreo().equalsIgnoreCase(request.getCorreo())) {
            Optional<Empleado> empleadoConCorreo = empleadoRepository.findByCorreo(request.getCorreo());
            if (empleadoConCorreo.isPresent() && !empleadoConCorreo.get().getIdEmpleado().equals(idEmpleado)) {
                throw new BusinessException("El correo " + request.getCorreo() + " ya está en uso por otro empleado");
            }
        }

        // Actualizar datos básicos
        empleado.setNombre(request.getNombre());
        empleado.setApellido(request.getApellido());
        empleado.setCorreo(request.getCorreo());
        empleado.setTelefono(request.getTelefono());

        // Persistir cambios
        empleado = empleadoRepository.update(empleado);

        // Retornar respuesta
        return mapToResponse(empleado);
    }

    /**
     * Mapea la entidad Empleado a PerfilEmpleadoResponse
     */
    private PerfilEmpleadoResponse mapToResponse(Empleado empleado) {
        PerfilEmpleadoResponse response = new PerfilEmpleadoResponse();
        response.setIdEmpleado(empleado.getIdEmpleado());
        response.setNombre(empleado.getNombre());
        response.setApellido(empleado.getApellido());
        response.setCorreo(empleado.getCorreo());
        response.setTelefono(empleado.getTelefono());

        // Mapear relaciones si existen
        if (empleado.getCargo() != null) {
            response.setCargo(empleado.getCargo().nombre);
        }

        if (empleado.getDepartamento() != null) {
            response.setDepartamento(empleado.getDepartamento().nombreDepart);
        }

        if (empleado.getEmpresa() != null) {
            response.setEmpresa(empleado.getEmpresa().nombreEmpresa);
        }

        return response;
    }
}
