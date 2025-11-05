package datum.travels.application.dto.reporte;

/**
 * DTO para representar los destinatarios de correo por país
 * Usado para mostrar opciones en el frontend
 */
public class DestinatarioReporteDTO {
    
    private String codigoPais;
    private String nombrePais;
    private String email;
    private String asuntoEjemplo;
    
    public DestinatarioReporteDTO() {}
    
    public DestinatarioReporteDTO(String codigoPais, String nombrePais, String email) {
        this.codigoPais = codigoPais;
        this.nombrePais = nombrePais;
        this.email = email;
        this.asuntoEjemplo = codigoPais.toUpperCase() + "-[PROVEEDOR]";
    }
    
    // Getters and Setters
    public String getCodigoPais() {
        return codigoPais;
    }
    
    public void setCodigoPais(String codigoPais) {
        this.codigoPais = codigoPais;
    }
    
    public String getNombrePais() {
        return nombrePais;
    }
    
    public void setNombrePais(String nombrePais) {
        this.nombrePais = nombrePais;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getAsuntoEjemplo() {
        return asuntoEjemplo;
    }
    
    public void setAsuntoEjemplo(String asuntoEjemplo) {
        this.asuntoEjemplo = asuntoEjemplo;
    }
}
