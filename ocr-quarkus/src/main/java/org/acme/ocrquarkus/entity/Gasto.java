package org.acme.ocrquarkus.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "Gasto")
public class Gasto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_gasto")
    public Long idGasto;

    @Column(name = "descripcion", length = 50)
    public String descripcion;

    @Column(name = "lugar", length = 100)
    public String lugar;

    @Column(name = "fecha")
    public LocalDate fecha;

    @Column(name = "monto")
    public Double monto;

    @Column(name = "id_categoria")
    public Long idCategoria;

    // Nombre del blob dentro del contenedor (clave real en Azure)
    @Column(name = "blob_name", length = 300)
    private String blobName;

    // URL completa del blob (útil para debug o para generar SAS a partir de ella)
    @Column(name = "blob_url", length = 1000)
    private String blobUrl;

    // Metadata opcional
    @Column(name = "file_content_type", length = 120)
    private String fileContentType;

    @Column(name = "file_size_bytes")
    private Long fileSize;


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

     // Constructor vacío
    public Gasto() {}

    public Gasto(String descripcion, String lugar, LocalDate fecha, Double monto) {
        this.descripcion = descripcion;
        this.lugar = lugar;
        this.fecha = fecha;
        this.monto = monto;

        this.blobName = null;
        this.blobUrl = null;
        this.fileContentType = null;
        this.fileSize = null;
    }


    
    

    
}
