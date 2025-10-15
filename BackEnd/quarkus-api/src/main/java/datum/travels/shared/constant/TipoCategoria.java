package datum.travels.shared.constant;

/**
 * Categorías de gastos
 */
public enum TipoCategoria {
    TRANSPORTE("transporte", "Gastos de transporte"),
    COMIDA("comida", "Gastos de alimentación"),
    ALOJAMIENTO("alojamiento", "Gastos de hospedaje"),
    COMBUSTIBLE("combustible", "Gastos de combustible"),
    TAXI("taxi", "Gastos de taxi"),
    OTROS("otros", "Otros gastos");

    private final String codigo;
    private final String descripcion;

    TipoCategoria(String codigo, String descripcion) {
        this.codigo = codigo;
        this.descripcion = descripcion;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public static TipoCategoria fromCodigo(String codigo) {
        if (codigo == null) {
            return OTROS;
        }
        
        for (TipoCategoria tipo : TipoCategoria.values()) {
            if (tipo.codigo.equalsIgnoreCase(codigo)) {
                return tipo;
            }
        }
        
        throw new IllegalArgumentException("Tipo de categoría no válido: " + codigo);
    }

    @Override
    public String toString() {
        return codigo;
    }
}
