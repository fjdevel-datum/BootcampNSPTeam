package datum.travels.application.port;

/**
 * Puerto para envío de correos electrónicos
 */
public interface EmailService {
    
    /**
     * Envía un correo electrónico
     * @param destinatario Dirección de correo
     * @param asunto Asunto del correo
     * @param cuerpo Cuerpo del mensaje
     * @return true si se envió correctamente
     */
    boolean enviarCorreo(String destinatario, String asunto, String cuerpo);
    
    /**
     * Envía un correo con adjuntos
     * @param destinatario Dirección de correo
     * @param asunto Asunto
     * @param cuerpo Mensaje
     * @param adjuntos Array de rutas de archivos adjuntos
     * @return true si se envió correctamente
     */
    boolean enviarCorreoConAdjuntos(String destinatario, String asunto, String cuerpo, String[] adjuntos);
}
