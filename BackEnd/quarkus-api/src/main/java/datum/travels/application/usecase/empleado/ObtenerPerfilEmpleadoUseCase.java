package datum.travels.application.usecase.empleado;

import datum.travels.application.dto.empleado.PerfilEmpleadoResponse;
import datum.travels.domain.model.Empleado;
import datum.travels.domain.repository.EmpleadoRepository;
import datum.travels.domain.exception.ResourceNotFoundException;
import datum.travels.shared.util.CurrentUserProvider;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Caso de Uso: Obtener Perfil del Empleado Autenticado
 * 
 * Responsabilidades:
 * 1. Obtener el ID del empleado desde el token JWT
 * 2. Buscar los datos completos del empleado en BD
 * 3. Convertir a DTO de respuesta incluyendo relaciones
 */
@ApplicationScoped
public class ObtenerPerfilEmpleadoUseCase {

    @Inject
    CurrentUserProvider currentUserProvider;

    @Inject
    EmpleadoRepository empleadoRepository;

    /**
     * Ejecuta el caso de uso para obtener el perfil del empleado autenticado
     *
     * @return PerfilEmpleadoResponse con datos completos del empleado
     * @throws ResourceNotFoundException si no se encuentra el empleado
     */
    public PerfilEmpleadoResponse execute() {
        // Obtener ID del empleado desde el token JWT
        Long idEmpleado = currentUserProvider.getIdEmpleado()
            .orElseThrow(() -> new ResourceNotFoundException(
                "No se encontró un empleado asociado al usuario autenticado"
            ));

        // Buscar empleado en BD con relaciones
        Empleado empleado = empleadoRepository.buscarPorId(idEmpleado)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Empleado no encontrado con ID: " + idEmpleado
            ));

        // Convertir a DTO de respuesta
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
