package datum.travels.application.port;

/**
 * Puerto para mensajería (JMS, Kafka, RabbitMQ, etc.)
 */
public interface MessageQueueService {
    
    /**
     * Envía un mensaje a una cola
     * @param nombreCola Nombre de la cola
     * @param mensaje Contenido del mensaje
     */
    void enviarMensaje(String nombreCola, String mensaje);
    
    /**
     * Envía un mensaje con prioridad
     * @param nombreCola Nombre de la cola
     * @param mensaje Contenido
     * @param prioridad Nivel de prioridad (1-10)
     */
    void enviarMensajeConPrioridad(String nombreCola, String mensaje, int prioridad);
}
