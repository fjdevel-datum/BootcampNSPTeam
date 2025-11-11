package datum.travels.domain.model;

/**
 * Enum de monedas soportadas en el sistema Datum Travels.
 * Basado en ISO 4217 para códigos de moneda.
 * 
 * Monedas de Centroamérica + USD + EUR (gastos internacionales)
 */
public enum MonedaEnum {
    USD("Dólar Estadounidense", "$", "US", 1.0),
    GTQ("Quetzal Guatemalteco", "Q", "GT", 7.7),      // Tasa aproximada
    HNL("Lempira Hondureño", "L", "HN", 24.5),        // Tasa aproximada
    PAB("Balboa Panameño", "B/.", "PA", 1.0),         // Paridad 1:1 con USD
    EUR("Euro", "€", "EU", 0.92);                     // Tasa aproximada

    private final String nombre;
    private final String simbolo;
    private final String codigoPais;
    private final double tasaAproximada; // Solo referencia, NO usar para conversiones reales

    MonedaEnum(String nombre, String simbolo, String codigoPais, double tasaAproximada) {
        this.nombre = nombre;
        this.simbolo = simbolo;
        this.codigoPais = codigoPais;
        this.tasaAproximada = tasaAproximada;
    }

    public String getNombre() {
        return nombre;
    }

    public String getSimbolo() {
        return simbolo;
    }

    public String getCodigoPais() {
        return codigoPais;
    }

    public double getTasaAproximada() {
        return tasaAproximada;
    }

    /**
     * Obtiene el código ISO 4217 de 3 letras
     */
    public String getCodigo() {
        return this.name();
    }

    /**
     * Valida si un código de moneda existe en el sistema
     */
    public static boolean esMonedaValida(String codigo) {
        if (codigo == null) return false;
        try {
            MonedaEnum.valueOf(codigo.toUpperCase());
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Obtiene el enum desde un código de moneda (ej: "GTQ")
     */
    public static MonedaEnum fromCodigo(String codigo) {
        return MonedaEnum.valueOf(codigo.toUpperCase());
    }
}
