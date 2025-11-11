package datum.travels.application.dto.empleado;

/**
 * DTO para listado administrativo de usuarios.
 */
public record UsuarioAdminResponse(
    Long idUsuario,
    Long idEmpleado,
    String usuarioApp,
    String correo,
    String nombre,
    String apellido,
    String telefono,
    String cargo,
    String departamento,
    String empresa,
    int totalTarjetas
) {
}
