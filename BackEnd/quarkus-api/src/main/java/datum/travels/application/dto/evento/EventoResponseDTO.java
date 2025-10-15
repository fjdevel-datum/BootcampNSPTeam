package datum.travels.application.dto.evento;

import java.time.LocalDate;

/**
 * DTO de respuesta al crear un nuevo evento
 * Retorna el evento creado con su ID y mensaje de éxito
 */
public class EventoResponseDTO {

    private Long id;
    private String nombreEvento;
    private LocalDate fechaRegistro;
    private String estado;
    private String mensaje;
    private boolean exitoso;

    // Constructors
    public EventoResponseDTO() {
    }

    public EventoResponseDTO(Long id, String nombreEvento, LocalDate fechaRegistro, String estado) {
        this.id = id;
        this.nombreEvento = nombreEvento;
        this.fechaRegistro = fechaRegistro;
        this.estado = estado;
    }

    // Helper methods para respuestas comunes
    public static EventoResponseDTO success(Long id, String nombreEvento, LocalDate fechaRegistro, String estado) {
        EventoResponseDTO dto = new EventoResponseDTO(id, nombreEvento, fechaRegistro, estado);
        dto.setMensaje("Evento creado exitosamente");
        dto.setExitoso(true);
        return dto;
    }

    public static EventoResponseDTO error(String mensaje) {
        EventoResponseDTO dto = new EventoResponseDTO();
        dto.setMensaje(mensaje);
        dto.setExitoso(false);
        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombreEvento() {
        return nombreEvento;
    }

    public void setNombreEvento(String nombreEvento) {
        this.nombreEvento = nombreEvento;
    }

    public LocalDate getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDate fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public boolean isExitoso() {
        return exitoso;
    }

    public void setExitoso(boolean exitoso) {
        this.exitoso = exitoso;
    }
}