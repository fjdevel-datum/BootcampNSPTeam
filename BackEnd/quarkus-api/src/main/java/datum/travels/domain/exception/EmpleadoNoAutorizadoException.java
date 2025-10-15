package datum.travels.domain.exception;

/**
 * Excepción cuando un empleado no tiene autorización
 */
public class EmpleadoNoAutorizadoException extends RuntimeException {
    
    public EmpleadoNoAutorizadoException(Long idEmpleado, String accion) {
        super(String.format("El empleado con ID %d no está autorizado para: %s", idEmpleado, accion));
    }

    public EmpleadoNoAutorizadoException(String mensaje) {
        super(mensaje);
    }
}
