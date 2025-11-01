package datum.travels.application.dto.gasto;

import datum.travels.domain.model.Gasto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO para respuesta de gasto
 * Contiene toda la información de un gasto con datos relacionados
 * 
 * @param idGasto - ID del gasto
 * @param idEvento - ID del evento
 * @param nombreEvento - Nombre del evento (para mostrar)
 * @param idCategoria - ID de la categoría
 * @param nombreCategoria - Nombre de la categoría (para mostrar)
 * @param idTarjeta - ID de la tarjeta (puede ser null)
 * @param numeroTarjeta - Últimos 4 dígitos de la tarjeta (para mostrar)
 * @param descripcion - Descripción del gasto
 * @param lugar - Lugar donde se realizó
 * @param fecha - Fecha del gasto
 * @param monto - Monto del gasto
 */
public record GastoResponse(
    Long idGasto,
    Long idEvento,
    String nombreEvento,
    Long idCategoria,
    String nombreCategoria,
    Long idTarjeta,
    String numeroTarjeta,
    String descripcion,
    String lugar,
    LocalDate fecha,
    BigDecimal monto
) {
    
    /**
     * Factory method para crear desde entidad Gasto
     */
    public static GastoResponse from(Gasto gasto) {
        return new GastoResponse(
            gasto.idGasto,
            gasto.evento != null ? gasto.evento.getIdEvento() : null,
            gasto.evento != null ? gasto.evento.getNombreEvento() : "Sin evento",
            gasto.categoria != null ? gasto.categoria.idCategoria : null,
            gasto.categoria != null ? gasto.categoria.nombreCategoria : "Sin categoría",
            gasto.tarjeta != null ? gasto.tarjeta.idTarjeta : null,
            gasto.tarjeta != null ? gasto.tarjeta.numeroTarjeta : "Efectivo",
            gasto.descripcion,
            gasto.lugar,
            gasto.fecha,
            gasto.monto
        );
    }
}
