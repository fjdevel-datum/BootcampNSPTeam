package datum.travels.application.dto.evento;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO para mostrar el detalle completo de un evento
 * Incluye información del empleado y sus gastos asociados
 */
public class EventoDetalleDTO {

    private Long id;
    private String nombreEvento;
    private LocalDate fechaRegistro;
    private String destino;
    private String estado;
    
    // Información del empleado
    private Long idEmpleado;
    private String nombreEmpleado;
    private String cargoEmpleado;
    private String departamentoEmpleado;
    
    // Gastos asociados (lista resumida)
    private List<GastoResumenDTO> gastos;
    private Integer totalGastos;

    // Constructors
    public EventoDetalleDTO() {
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

    public String getDestino() {
        return destino;
    }

    public void setDestino(String destino) {
        this.destino = destino;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Long getIdEmpleado() {
        return idEmpleado;
    }

    public void setIdEmpleado(Long idEmpleado) {
        this.idEmpleado = idEmpleado;
    }

    public String getNombreEmpleado() {
        return nombreEmpleado;
    }

    public void setNombreEmpleado(String nombreEmpleado) {
        this.nombreEmpleado = nombreEmpleado;
    }

    public String getCargoEmpleado() {
        return cargoEmpleado;
    }

    public void setCargoEmpleado(String cargoEmpleado) {
        this.cargoEmpleado = cargoEmpleado;
    }

    public String getDepartamentoEmpleado() {
        return departamentoEmpleado;
    }

    public void setDepartamentoEmpleado(String departamentoEmpleado) {
        this.departamentoEmpleado = departamentoEmpleado;
    }

    public List<GastoResumenDTO> getGastos() {
        return gastos;
    }

    public void setGastos(List<GastoResumenDTO> gastos) {
        this.gastos = gastos;
    }

    public Integer getTotalGastos() {
        return totalGastos;
    }

    public void setTotalGastos(Integer totalGastos) {
        this.totalGastos = totalGastos;
    }

    /**
     * Inner DTO para información resumida de gastos dentro del detalle del evento
     */
    public static class GastoResumenDTO {
        private Long id;
        private String concepto;
        private String tipoGasto;
        private Double monto;
        private LocalDate fechaGasto;

        public GastoResumenDTO() {
        }

        // Getters and Setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getConcepto() {
            return concepto;
        }

        public void setConcepto(String concepto) {
            this.concepto = concepto;
        }

        public String getTipoGasto() {
            return tipoGasto;
        }

        public void setTipoGasto(String tipoGasto) {
            this.tipoGasto = tipoGasto;
        }

        public Double getMonto() {
            return monto;
        }

        public void setMonto(Double monto) {
            this.monto = monto;
        }

        public LocalDate getFechaGasto() {
            return fechaGasto;
        }

        public void setFechaGasto(LocalDate fechaGasto) {
            this.fechaGasto = fechaGasto;
        }
    }
}
