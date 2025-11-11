package datum.travels.application.port.output;

import datum.travels.domain.model.Evento;
import datum.travels.domain.model.Gasto;
import java.io.ByteArrayOutputStream;
import java.util.List;

/**
 * Puerto de salida para generación de reportes
 * Define el contrato para generar reportes en diferentes formatos
 */
public interface ReporteGeneratorPort {
    
    /**
     * Genera un reporte de gastos en formato Excel
     * 
     * @param evento Evento con información general
     * @param gastos Lista de gastos del evento
     * @return ByteArrayOutputStream con el contenido del archivo Excel
     */
    ByteArrayOutputStream generarReporteExcel(Evento evento, List<Gasto> gastos);
    
    /**
     * Genera un reporte de gastos en formato PDF
     * 
     * @param evento Evento con información general
     * @param gastos Lista de gastos del evento
     * @return ByteArrayOutputStream con el contenido del archivo PDF
     */
    ByteArrayOutputStream generarReportePDF(Evento evento, List<Gasto> gastos);
}
