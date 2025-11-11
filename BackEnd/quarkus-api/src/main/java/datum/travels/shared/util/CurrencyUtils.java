package datum.travels.shared.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.util.Locale;

/**
 * Utilidades para manejo de monedas
 */
public class CurrencyUtils {
    
    /**
     * Redondea un monto a 2 decimales
     */
    public static BigDecimal redondear(BigDecimal monto) {
        return monto.setScale(2, RoundingMode.HALF_UP);
    }
    
    /**
     * Convierte Double a BigDecimal con 2 decimales
     */
    public static BigDecimal dobleToBigDecimal(Double valor) {
        return BigDecimal.valueOf(valor).setScale(2, RoundingMode.HALF_UP);
    }
    
    /**
     * Formatea un monto como moneda USD
     */
    public static String formatearComoUSD(BigDecimal monto) {
        NumberFormat formatter = NumberFormat.getCurrencyInstance(Locale.US);
        return formatter.format(monto);
    }
    
    /**
     * Valida que un monto sea positivo
     */
    public static boolean esMontoValido(BigDecimal monto) {
        return monto != null && monto.compareTo(BigDecimal.ZERO) > 0;
    }
}
