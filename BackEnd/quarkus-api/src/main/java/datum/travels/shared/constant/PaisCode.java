package datum.travels.shared.constant;

/**
 * Códigos de países soportados
 */
public enum PaisCode {
    SV("El Salvador", "SV", "+503"),
    GT("Guatemala", "GT", "+502"),
    HN("Honduras", "HN", "+504"),
    PA("Panamá", "PA", "+507");

    private final String nombre;
    private final String codigo;
    private final String codigoTelefonico;

    PaisCode(String nombre, String codigo, String codigoTelefonico) {
        this.nombre = nombre;
        this.codigo = codigo;
        this.codigoTelefonico = codigoTelefonico;
    }

    public String getNombre() {
        return nombre;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getCodigoTelefonico() {
        return codigoTelefonico;
    }

    public static PaisCode fromCodigo(String codigo) {
        if (codigo == null) {
            throw new IllegalArgumentException("Código de país no puede ser nulo");
        }
        
        for (PaisCode pais : PaisCode.values()) {
            if (pais.codigo.equalsIgnoreCase(codigo)) {
                return pais;
            }
        }
        
        throw new IllegalArgumentException("Código de país no válido: " + codigo);
    }

    @Override
    public String toString() {
        return codigo;
    }
}
