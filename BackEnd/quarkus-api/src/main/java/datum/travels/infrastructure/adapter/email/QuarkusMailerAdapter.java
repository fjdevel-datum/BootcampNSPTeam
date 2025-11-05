package datum.travels.infrastructure.adapter.email;

import datum.travels.application.port.output.EmailSenderPort;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

/**
 * Implementación del puerto de envío de correos usando Quarkus Mailer
 * Utiliza configuración SMTP de application.properties
 */
@ApplicationScoped
public class QuarkusMailerAdapter implements EmailSenderPort {
    
    private static final Logger LOG = Logger.getLogger(QuarkusMailerAdapter.class);
    
    @Inject
    Mailer mailer;
    
    @Override
    public void enviarConAdjunto(
            String emailDestino,
            String asunto,
            String cuerpo,
            String archivoNombre,
            byte[] archivoContenido,
            String archivoContentType) {
        
        LOG.infof("Enviando correo a %s con asunto: %s", emailDestino, asunto);
        
        try {
            // Envío síncrono
            mailer.send(
                Mail.withHtml(emailDestino, asunto, cuerpo)
                    .addAttachment(archivoNombre, archivoContenido, archivoContentType)
            );
            
            LOG.infof("Correo enviado exitosamente a %s", emailDestino);
            
        } catch (Exception e) {
            LOG.errorf(e, "Error al enviar correo a %s", emailDestino);
            throw new RuntimeException("Error al enviar correo: " + e.getMessage(), e);
        }
    }
}