package datum.travels.domain.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "Gasto")
public class Gasto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_gasto")
    public Long idGasto;

    @ManyToOne
    @JoinColumn(name = "id_evento")
    public Evento evento;

    @ManyToOne
    @JoinColumn(name = "id_tarjeta")
    public Tarjeta tarjeta;

    @ManyToOne
    @JoinColumn(name = "id_categoria")
    public CategoriaGasto categoria;

    @Column(name = "descripcion", length = 50)
    public String descripcion;

    @Column(name = "lugar", length = 100)
    public String lugar;

    @Column(name = "fecha")
    public LocalDate fecha;

    @Column(name = "monto", precision = 10, scale = 2)
    public BigDecimal monto; // Valor ORIGINAL de la factura (ej: 34.25 GTQ)

    // Campos para manejo multi-moneda
    @Column(name = "moneda", length = 3)
    public String moneda; // ISO 4217: USD, GTQ, HNL, PAB, EUR

    @Column(name = "monto_usd", precision = 10, scale = 2)
    public BigDecimal montoUsd; // Monto convertido a USD (ej: 4.45)

    @Column(name = "tasa_cambio", precision = 10, scale = 6)
    public BigDecimal tasaCambio; // Tasa de conversión usada (ej: 0.13 para GTQ->USD)

    @Column(name = "fecha_tasa_cambio")
    public LocalDate fechaTasaCambio; // Fecha en que se obtuvo la tasa

    // Nombre del blob dentro del contenedor (clave real en Azure)
    @Column(name = "blob_name", length = 300)
    private String blobName;

    // URL completa del blob (util para debug o para generar SAS a partir de ella)
    @Column(name = "blob_url", length = 1000)
    private String blobUrl;

    // Metadata opcional
    @Column(name = "file_content_type", length = 120)
    private String fileContentType;

    @Column(name = "file_size_bytes")
    private Long fileSize;

    @Column(name = "openkm_doc_uuid", length = 64)
    private String openkmDocUuid;

    // Getters y Setters
     // Getters y Setters
    public Long getIdGasto() {
        return idGasto;
    }

    public void setIdGasto(Long idGasto) {
        this.idGasto = idGasto;
    }

    public Evento getEvento() {
        return evento;
    }

    public void setEvento(Evento evento) {
        this.evento = evento;
    }

    public Tarjeta getTarjeta() {
        return tarjeta;
    }

    public void setTarjeta(Tarjeta tarjeta) {
        this.tarjeta = tarjeta;
    }

    public CategoriaGasto getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaGasto categoria) {
        this.categoria = categoria;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getLugar() {
        return lugar;
    }

    public void setLugar(String lugar) {
        this.lugar = lugar;
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

    public String getMoneda() {
        return moneda;
    }

    public void setMoneda(String moneda) {
        this.moneda = moneda;
    }

    public BigDecimal getMontoUsd() {
        return montoUsd;
    }

    public void setMontoUsd(BigDecimal montoUsd) {
        this.montoUsd = montoUsd;
    }

    public BigDecimal getTasaCambio() {
        return tasaCambio;
    }

    public void setTasaCambio(BigDecimal tasaCambio) {
        this.tasaCambio = tasaCambio;
    }

    public LocalDate getFechaTasaCambio() {
        return fechaTasaCambio;
    }

    public void setFechaTasaCambio(LocalDate fechaTasaCambio) {
        this.fechaTasaCambio = fechaTasaCambio;
    }

    public String getBlobName() {
        return blobName;
    }

    public void setBlobName(String blobName) {
        this.blobName = blobName;
    }

    public String getBlobUrl() {
        return blobUrl;
    }

    public void setBlobUrl(String blobUrl) {
        this.blobUrl = blobUrl;
    }

    public String getFileContentType() {
        return fileContentType;
    }

    public void setFileContentType(String fileContentType) {
        this.fileContentType = fileContentType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getOpenkmDocUuid() {
        return openkmDocUuid;
    }

    public void setOpenkmDocUuid(String openkmDocUuid) {
        this.openkmDocUuid = openkmDocUuid;
    }

    // Constructor vacío
    public Gasto() {}

    // Constructor actualizado
    public Gasto(Evento evento, String descripcion, String lugar, BigDecimal monto, LocalDate fecha) {
        this.evento = evento;
        this.descripcion = descripcion;
        this.lugar = lugar;
        this.monto = monto;
        this.fecha = fecha;
        this.blobName = null;
        this.blobUrl = null;
        this.fileContentType = null;
        this.fileSize = null;
        this.openkmDocUuid = null;
    }
}