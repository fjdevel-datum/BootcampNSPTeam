package datum.travels.application.dto.gasto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO de respuesta con información de un gasto
 * 
 * @author Datum Travels Team
 */
public class GastoResponseDTO {

    private Long idGasto;
    private Long idEvento;
    private String nombreEvento; // Para mostrar en el frontend
    private Long idCategoria;
    private String nombreCategoria; // Nombre de la categoría
    private Long idTarjeta;
    private String numeroTarjeta; // Últimos 4 dígitos (seguridad)
    private String lugar;
    private String descripcion;
    private LocalDate fecha;
    private BigDecimal monto;
    private String capturaComprobante; // URL o path de la imagen
    private boolean tieneComprobante; // Si ya subió la foto

    // Constructores
    public GastoResponseDTO() {
    }

    // Getters y Setters
    public Long getIdGasto() {
        return idGasto;
    }

    public void setIdGasto(Long idGasto) {
        this.idGasto = idGasto;
    }

    public Long getIdEvento() {
        return idEvento;
    }

    public void setIdEvento(Long idEvento) {
        this.idEvento = idEvento;
    }

    public String getNombreEvento() {
        return nombreEvento;
    }

    public void setNombreEvento(String nombreEvento) {
        this.nombreEvento = nombreEvento;
    }

    public Long getIdCategoria() {
        return idCategoria;
    }

    public void setIdCategoria(Long idCategoria) {
        this.idCategoria = idCategoria;
    }

    public String getNombreCategoria() {
        return nombreCategoria;
    }

    public void setNombreCategoria(String nombreCategoria) {
        this.nombreCategoria = nombreCategoria;
    }

    public Long getIdTarjeta() {
        return idTarjeta;
    }

    public void setIdTarjeta(Long idTarjeta) {
        this.idTarjeta = idTarjeta;
    }

    public String getNumeroTarjeta() {
        return numeroTarjeta;
    }

    public void setNumeroTarjeta(String numeroTarjeta) {
        this.numeroTarjeta = numeroTarjeta;
    }

    public String getLugar() {
        return lugar;
    }

    public void setLugar(String lugar) {
        this.lugar = lugar;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public String getCapturaComprobante() {
        return capturaComprobante;
    }

    public void setCapturaComprobante(String capturaComprobante) {
        this.capturaComprobante = capturaComprobante;
    }

    public boolean isTieneComprobante() {
        return tieneComprobante;
    }

    public void setTieneComprobante(boolean tieneComprobante) {
        this.tieneComprobante = tieneComprobante;
    }
}