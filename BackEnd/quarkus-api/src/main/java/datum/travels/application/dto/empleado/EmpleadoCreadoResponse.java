package datum.travels.application.dto.empleado;

/**
 * Respuesta para la creación de empleados.
 */
public record EmpleadoCreadoResponse(
    Long idEmpleado,
    Long idDepartamento,
    Long idCargo,
    Long idEmpresa,
    String nombre,
    String apellido,
    String correo,
    String telefono,
    String usuario,
    String keycloakId
) {
}
