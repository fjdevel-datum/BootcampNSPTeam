package datum.travels.shared.util;

import java.util.regex.Pattern;

/**
 * Utilidades para validaciones
 */
public class ValidationUtils {
    
    private static final Pattern EMAIL_PATTERN = 
        Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    
    /**
     * Valida si un string es null o vacío
     */
    public static boolean esNuloOVacio(String valor) {
        return valor == null || valor.trim().isEmpty();
    }
    
    /**
     * Valida formato de email
     */
    public static boolean esEmailValido(String email) {
        if (esNuloOVacio(email)) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();
    }
    
    /**
     * Valida longitud de string
     */
    public static boolean tieneLongitudValida(String valor, int min, int max) {
        if (valor == null) {
            return false;
        }
        int longitud = valor.length();
        return longitud >= min && longitud <= max;
    }
    
    /**
     * Valida que un ID sea positivo
     */
    public static boolean esIdValido(Long id) {
        return id != null && id > 0;
    }
}
