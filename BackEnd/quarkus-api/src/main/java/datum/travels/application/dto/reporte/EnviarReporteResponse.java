package datum.travels.application.dto.reporte;

/**
 * DTO de respuesta al enviar un reporte de gastos
 */
public class EnviarReporteResponse {
    
    private boolean exitoso;
    private String mensaje;
    private String emailDestino;
    private String asunto;
    private String formato;
    private int cantidadGastos;
    
    public EnviarReporteResponse() {}
    
    public static EnviarReporteResponse success(
            String emailDestino, 
            String asunto, 
            String formato,
            int cantidadGastos) {
        EnviarReporteResponse response = new EnviarReporteResponse();
        response.exitoso = true;
        response.mensaje = "Reporte enviado exitosamente a " + emailDestino;
        response.emailDestino = emailDestino;
        response.asunto = asunto;
        response.formato = formato;
        response.cantidadGastos = cantidadGastos;
        return response;
    }
    
    public static EnviarReporteResponse error(String mensaje) {
        EnviarReporteResponse response = new EnviarReporteResponse();
        response.exitoso = false;
        response.mensaje = mensaje;
        return response;
    }
    
    // Getters and Setters
    public boolean isExitoso() {
        return exitoso;
    }
    
    public void setExitoso(boolean exitoso) {
        this.exitoso = exitoso;
    }
    
    public String getMensaje() {
        return mensaje;
    }
    
    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
    
    public String getEmailDestino() {
        return emailDestino;
    }
    
    public void setEmailDestino(String emailDestino) {
        this.emailDestino = emailDestino;
    }
    
    public String getAsunto() {
        return asunto;
    }
    
    public void setAsunto(String asunto) {
        this.asunto = asunto;
    }
    
    public String getFormato() {
        return formato;
    }
    
    public void setFormato(String formato) {
        this.formato = formato;
    }
    
    public int getCantidadGastos() {
        return cantidadGastos;
    }
    
    public void setCantidadGastos(int cantidadGastos) {
        this.cantidadGastos = cantidadGastos;
    }
}
