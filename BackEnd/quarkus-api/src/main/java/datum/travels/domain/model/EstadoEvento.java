package datum.travels.domain.model;

/**
 * Enum para representar los estados posibles de un Evento
 */
public enum EstadoEvento {
    ACTIVO("activo"),
    COMPLETADO("completado"),
    CANCELADO("cancelado"),
    PENDIENTE("pendiente");

    private final String valor;

    EstadoEvento(String valor) {
        this.valor = valor;
    }

    public String getValor() {
        return valor;
    }

    public static EstadoEvento fromString(String texto) {
        if (texto == null) {
            return ACTIVO;
        }
        
        for (EstadoEvento estado : EstadoEvento.values()) {
            if (estado.valor.equalsIgnoreCase(texto)) {
                return estado;
            }
        }
        
        throw new IllegalArgumentException("Estado de evento no válido: " + texto);
    }

    @Override
    public String toString() {
        return valor;
    }
}
