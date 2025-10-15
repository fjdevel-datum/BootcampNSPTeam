package datum.travels.application.port;

/**
 * Puerto para generación de reportes
 */
public interface ReportGeneratorService {
    
    /**
     * Genera un reporte en formato Excel
     * @param idEvento ID del evento
     * @return Byte array del archivo Excel
     */
    byte[] generarReporteExcel(Long idEvento);
    
    /**
     * Genera un reporte en formato PDF
     * @param idEvento ID del evento
     * @return Byte array del archivo PDF
     */
    byte[] generarReportePDF(Long idEvento);
    
    /**
     * Genera un resumen de gastos
     * @param idEvento ID del evento
     * @param formato "excel" o "pdf"
     * @return Byte array del reporte
     */
    byte[] generarResumenGastos(Long idEvento, String formato);
}
