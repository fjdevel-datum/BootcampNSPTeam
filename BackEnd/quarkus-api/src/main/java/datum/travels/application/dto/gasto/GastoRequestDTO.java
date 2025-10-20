package datum.travels.application.dto.gasto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO para crear un nuevo gasto
 * 
 * @author Datum Travels Team
 */
public class GastoRequestDTO {

    @NotNull(message = "El ID del evento es obligatorio")
    private Long idEvento;

    @NotNull(message = "La categoría del gasto es obligatoria")
    private Long idCategoria;

    private Long idTarjeta; // Opcional, si no tiene tarjeta corporativa

    @NotNull(message = "El lugar es obligatorio")
    @Size(min = 3, max = 150, message = "El lugar debe tener entre 3 y 150 caracteres")
    private String lugar;

    @Size(max = 75, message = "La descripción no puede superar 75 caracteres")
    private String descripcion;

    @NotNull(message = "La fecha del gasto es obligatoria")
    private LocalDate fecha;

    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor a cero")
    private BigDecimal monto;

    private String comprbanteBase64; // Imagen en Base64 (opcional al crear, se sube después)

    // Constructores
    public GastoRequestDTO() {
    }

    public GastoRequestDTO(Long idEvento, Long idCategoria, String lugar, LocalDate fecha, BigDecimal monto) {
        this.idEvento = idEvento;
        this.idCategoria = idCategoria;
        this.lugar = lugar;
        this.fecha = fecha;
        this.monto = monto;
    }

    // Getters y Setters
    public Long getIdEvento() {
        return idEvento;
    }

    public void setIdEvento(Long idEvento) {
        this.idEvento = idEvento;
    }

    public Long getIdCategoria() {
        return idCategoria;
    }

    public void setIdCategoria(Long idCategoria) {
        this.idCategoria = idCategoria;
    }

    public Long getIdTarjeta() {
        return idTarjeta;
    }

    public void setIdTarjeta(Long idTarjeta) {
        this.idTarjeta = idTarjeta;
    }

    public String getLugar() {
        return lugar;
    }

    public void setLugar(String lugar) {
        this.lugar = lugar;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public String getComprbanteBase64() {
        return comprbanteBase64;
    }

    public void setComprbanteBase64(String comprbanteBase64) {
        this.comprbanteBase64 = comprbanteBase64;
    }
}
