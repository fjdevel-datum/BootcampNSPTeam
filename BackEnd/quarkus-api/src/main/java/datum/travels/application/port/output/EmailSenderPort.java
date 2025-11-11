package datum.travels.application.port.output;

/**
 * Puerto de salida para envío de correos
 * Define el contrato para enviar correos electrónicos
 */
public interface EmailSenderPort {
    
    /**
     * Envía un correo con un archivo adjunto
     * 
     * @param emailDestino Email del destinatario
     * @param asunto Asunto del correo
     * @param cuerpo Cuerpo del mensaje (puede incluir HTML)
     * @param archivoNombre Nombre del archivo adjunto
     * @param archivoContenido Contenido del archivo en bytes
     * @param archivoContentType Content-Type del archivo (ej: application/pdf)
     */
    void enviarConAdjunto(
        String emailDestino,
        String asunto,
        String cuerpo,
        String archivoNombre,
        byte[] archivoContenido,
        String archivoContentType
    );
}
