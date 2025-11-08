package datum.travels.infrastructure.adapter.external;

import datum.travels.domain.model.MonedaEnum;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Map;

/**
 * Servicio para convertir monedas usando la API de exchangerate-api.com
 * 
 * Flujo:
 * 1. Recibe monto en moneda original (ej: 34.25 GTQ)
 * 2. Consulta tasa de cambio del día
 * 3. Retorna monto convertido a USD
 * 
 * IMPORTANTE: El monto original se mantiene en Gasto.monto
 *             El monto convertido se guarda en Gasto.montoUsd
 */
@ApplicationScoped
public class ConversionMonedaService {

    private static final Logger LOG = Logger.getLogger(ConversionMonedaService.class);

    @ConfigProperty(name = "exchangerate.api.key", defaultValue = "DEMO_KEY")
    String apiKey;

    @ConfigProperty(name = "exchangerate.api.url", defaultValue = "https://v6.exchangerate-api.com/v6")
    String apiUrl;

    private final Client client = ClientBuilder.newClient();

    /**
     * Convierte un monto de cualquier moneda a USD
     * 
     * @param monto Monto en la moneda original
     * @param monedaOrigen Código ISO de la moneda (GTQ, HNL, etc.)
     * @return Monto convertido a USD
     */
    public BigDecimal convertirAUSD(BigDecimal monto, String monedaOrigen) {
        // Si ya es USD, retornar el mismo monto
        if ("USD".equalsIgnoreCase(monedaOrigen)) {
            return monto;
        }

        // Validar que la moneda exista en nuestro sistema
        if (!MonedaEnum.esMonedaValida(monedaOrigen)) {
            throw new IllegalArgumentException("Moneda no soportada: " + monedaOrigen);
        }

        try {
            BigDecimal tasaCambio = obtenerTasaCambio(monedaOrigen, "USD");
            BigDecimal montoUSD = monto.multiply(tasaCambio).setScale(2, RoundingMode.HALF_UP);
            
            LOG.infof("Conversión: %.2f %s = %.2f USD (Tasa: %.6f)", 
                      monto, monedaOrigen, montoUSD, tasaCambio);
            
            return montoUSD;
        } catch (Exception e) {
            LOG.errorf("Error al convertir %s a USD: %s", monedaOrigen, e.getMessage());
            throw new RuntimeException("Error en conversión de moneda: " + e.getMessage(), e);
        }
    }

    /**
     * Obtiene la tasa de cambio entre dos monedas
     * 
     * @param monedaOrigen Código ISO de la moneda origen
     * @param monedaDestino Código ISO de la moneda destino
     * @return Tasa de cambio (ej: 0.13 para GTQ->USD)
     */
    public BigDecimal obtenerTasaCambio(String monedaOrigen, String monedaDestino) {
        try {
            String url = String.format("%s/%s/pair/%s/%s", 
                                       apiUrl, apiKey, monedaOrigen, monedaDestino);
            
            LOG.infof("Consultando tasa de cambio: %s -> %s", monedaOrigen, monedaDestino);

            Map<String, Object> response = client
                .target(url)
                .request(MediaType.APPLICATION_JSON)
                .get(Map.class);

            if ("success".equals(response.get("result"))) {
                Double conversionRate = (Double) response.get("conversion_rate");
                return BigDecimal.valueOf(conversionRate);
            } else {
                throw new RuntimeException("Error en API: " + response.get("error-type"));
            }

        } catch (Exception e) {
            LOG.errorf("Error al obtener tasa de cambio: %s", e.getMessage());
            
            // Fallback: usar tasa aproximada del enum (NO recomendado en producción)
            LOG.warn("Usando tasa de cambio aproximada (fallback). Configurar API Key válida.");
            return obtenerTasaFallback(monedaOrigen);
        }
    }

    /**
     * Tasa de cambio de emergencia (cuando la API falla)
     * SOLO USAR PARA DESARROLLO/TESTING
     */
    private BigDecimal obtenerTasaFallback(String monedaOrigen) {
        MonedaEnum moneda = MonedaEnum.fromCodigo(monedaOrigen);
        
        // Las tasas del enum son [Moneda] -> USD, así que invertimos
        double tasa = 1.0 / moneda.getTasaAproximada();
        
        LOG.warnf("⚠️ Usando tasa APROXIMADA para %s: %.6f (NO usar en producción)", 
                  monedaOrigen, tasa);
        
        return BigDecimal.valueOf(tasa).setScale(6, RoundingMode.HALF_UP);
    }

    /**
     * Obtiene la fecha de la última actualización de tasas
     */
    public LocalDate obtenerFechaActualizacion() {
        // Por defecto, la API actualiza tasas diariamente
        return LocalDate.now();
    }
}
