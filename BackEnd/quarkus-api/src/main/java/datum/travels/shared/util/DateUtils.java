package datum.travels.shared.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Utilidades para manejo de fechas
 */
public class DateUtils {
    
    private static final DateTimeFormatter FORMATTER_DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter FORMATTER_DATETIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    /**
     * Convierte String a LocalDate
     */
    public static LocalDate parsearFecha(String fecha) {
        return LocalDate.parse(fecha, FORMATTER_DATE);
    }
    
    /**
     * Convierte LocalDate a String
     */
    public static String formatearFecha(LocalDate fecha) {
        return fecha.format(FORMATTER_DATE);
    }
    
    /**
     * Convierte LocalDateTime a String
     */
    public static String formatearFechaHora(LocalDateTime fechaHora) {
        return fechaHora.format(FORMATTER_DATETIME);
    }
    
    /**
     * Verifica si una fecha está en el rango
     */
    public static boolean estaEnRango(LocalDate fecha, LocalDate inicio, LocalDate fin) {
        return !fecha.isBefore(inicio) && !fecha.isAfter(fin);
    }
}
