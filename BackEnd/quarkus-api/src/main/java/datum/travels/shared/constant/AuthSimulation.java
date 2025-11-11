package datum.travels.shared.constant;

/**
 * Constantes para simular autenticación mientras no existe login
 * 
 * ⚠️ TEMPORAL - Remover cuando se implemente el sistema de autenticación real
 * 
 * 📝 Para cambiar el usuario simulado:
 * 1. Modifica el valor de ID_EMPLEADO_SIMULADO
 * 2. Asegúrate de que ese ID exista en la tabla Empleado de tu BD
 * 3. Guarda el archivo (Ctrl+S)
 * 4. Espera 2-3 segundos para hot reload
 */
public final class AuthSimulation {
    
    /**
     * ID del empleado que simula estar autenticado
     * 
     * 🔧 EDITA ESTE VALOR para cambiar el usuario simulado
     * 
     * Ejemplo:
     * - ID_EMPLEADO_SIMULADO = 1L  → Simula que Carlos Martínez está logueado
     * - ID_EMPLEADO_SIMULADO = 2L  → Simula que otro empleado está logueado
     */
    public static final Long ID_EMPLEADO_SIMULADO = 1L;
    
    // Constructor privado para evitar instanciación
    private AuthSimulation() {
        throw new UnsupportedOperationException("Esta es una clase de constantes y no debe ser instanciada");
    }
}
