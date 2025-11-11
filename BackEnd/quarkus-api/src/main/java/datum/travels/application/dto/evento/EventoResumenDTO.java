package datum.travels.application.dto.evento;

import java.time.LocalDate;

/**
 * DTO para mostrar la lista de eventos en la pantalla HOME
 * Muestra información resumida de cada evento
 */
public class EventoResumenDTO {

    private Long id;
    private String nombreEvento;
    private LocalDate fechaRegistro;
    private String estado; // activo, completado, pendiente

    // Constructors
    public EventoResumenDTO() {
    }

    public EventoResumenDTO(Long id, String nombreEvento, LocalDate fechaRegistro, String estado) {
        this.id = id;
        this.nombreEvento = nombreEvento;
        this.fechaRegistro = fechaRegistro;
        this.estado = estado;
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
}