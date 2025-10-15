package datum.travels.application.usecase.gasto;

/**
 * Caso de uso: Procesar imagen de gasto con OCR
 */
public interface ProcesarImagenOCRUseCase {
    
    /**
     * Procesa imagen de factura/recibo con OCR
     * @param imagenBase64 Imagen en Base64
     * @param idGasto ID del gasto asociado
     * @return Datos extraídos y guardados
     */
    DatosExtraidosDTO ejecutar(String imagenBase64, Long idGasto);
}

/**
 * DTO para datos extraídos
 */
class DatosExtraidosDTO {
    private String nombreEmpresa;
    private Double monto;
    private String descripcion;
    private String fecha;
    
    // Getters y Setters
    public String getNombreEmpresa() { return nombreEmpresa; }
    public void setNombreEmpresa(String nombreEmpresa) { this.nombreEmpresa = nombreEmpresa; }
    
    public Double getMonto() { return monto; }
    public void setMonto(Double monto) { this.monto = monto; }
    
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    
    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }
}
