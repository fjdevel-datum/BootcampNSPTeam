package datum.travels.domain.valueobject;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Value Object para representar un monto de gasto
 * Inmutable y con validaciones de negocio
 */
public class MontoGasto {
    
    private final BigDecimal valor;
    private final String moneda;

    private MontoGasto(BigDecimal valor, String moneda) {
        this.valor = valor;
        this.moneda = moneda;
    }

    public static MontoGasto of(BigDecimal valor, String moneda) {
        validar(valor, moneda);
        return new MontoGasto(valor, moneda);
    }

    public static MontoGasto of(double valor, String moneda) {
        return of(BigDecimal.valueOf(valor), moneda);
    }

    private static void validar(BigDecimal valor, String moneda) {
        if (valor == null) {
            throw new IllegalArgumentException("El monto no puede ser nulo");
        }
        if (valor.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El monto no puede ser negativo");
        }
        if (moneda == null || moneda.trim().isEmpty()) {
            throw new IllegalArgumentException("La moneda no puede ser nula o vacía");
        }
    }

    public BigDecimal getValor() {
        return valor;
    }

    public String getMoneda() {
        return moneda;
    }

    public boolean esMayorQue(MontoGasto otro) {
        validarMismaMoneda(otro);
        return this.valor.compareTo(otro.valor) > 0;
    }

    public boolean esMenorQue(MontoGasto otro) {
        validarMismaMoneda(otro);
        return this.valor.compareTo(otro.valor) < 0;
    }

    public MontoGasto sumar(MontoGasto otro) {
        validarMismaMoneda(otro);
        return new MontoGasto(this.valor.add(otro.valor), this.moneda);
    }

    public MontoGasto restar(MontoGasto otro) {
        validarMismaMoneda(otro);
        BigDecimal resultado = this.valor.subtract(otro.valor);
        if (resultado.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El resultado no puede ser negativo");
        }
        return new MontoGasto(resultado, this.moneda);
    }

    private void validarMismaMoneda(MontoGasto otro) {
        if (!this.moneda.equals(otro.moneda)) {
            throw new IllegalArgumentException(
                String.format("No se pueden operar montos con diferentes monedas: %s y %s", 
                    this.moneda, otro.moneda)
            );
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MontoGasto that = (MontoGasto) o;
        return valor.compareTo(that.valor) == 0 && Objects.equals(moneda, that.moneda);
    }

    @Override
    public int hashCode() {
        return Objects.hash(valor, moneda);
    }

    @Override
    public String toString() {
        return String.format("%s %s", moneda, valor);
    }
}
