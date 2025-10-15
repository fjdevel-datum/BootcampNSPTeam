package datum.travels.application.port;

/**
 * Puerto para servicio de OCR (Optical Character Recognition)
 * Define el contrato para procesar imágenes y extraer texto
 */
public interface OCRService {
    
    /**
     * Procesa una imagen y extrae datos de texto
     * @param imagenBase64 Imagen codificada en Base64
     * @return Datos extraídos en formato estructurado
     */
    OCRDataResponse procesarImagen(String imagenBase64);
    
    /**
     * Procesa una imagen desde una URL
     * @param imageUrl URL de la imagen
     * @return Datos extraídos
     */
    OCRDataResponse procesarImagenDesdeUrl(String imageUrl);
}

/**
 * DTO para respuesta de OCR
 */
class OCRDataResponse {
    private String nombreEmpresa;
    private String descripcion;
    private Double montoTotal;
    private String fecha;
    private Double confianza; // 0.0 a 1.0

    // Getters y Setters
    public String getNombreEmpresa() { return nombreEmpresa; }
    public void setNombreEmpresa(String nombreEmpresa) { this.nombreEmpresa = nombreEmpresa; }
    
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    
    public Double getMontoTotal() { return montoTotal; }
    public void setMontoTotal(Double montoTotal) { this.montoTotal = montoTotal; }
    
    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }
    
    public Double getConfianza() { return confianza; }
    public void setConfianza(Double confianza) { this.confianza = confianza; }
}
