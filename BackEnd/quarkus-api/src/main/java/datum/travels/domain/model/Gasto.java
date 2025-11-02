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
    public BigDecimal monto;

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
