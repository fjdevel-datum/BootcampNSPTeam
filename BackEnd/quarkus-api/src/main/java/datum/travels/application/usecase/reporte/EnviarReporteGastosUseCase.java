package datum.travels.application.usecase.reporte;

import datum.travels.application.dto.reporte.EnviarReporteRequest;
import datum.travels.application.dto.reporte.EnviarReporteResponse;
import datum.travels.application.port.output.EmailSenderPort;
import datum.travels.application.port.output.ReporteGeneratorPort;
import datum.travels.domain.exception.ResourceNotFoundException;
import datum.travels.domain.model.Evento;
import datum.travels.domain.model.Gasto;
import datum.travels.domain.repository.EventoRepository;
import datum.travels.domain.repository.GastoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.io.ByteArrayOutputStream;
import java.util.List;

/**
 * Caso de Uso: Finalizar Evento y Enviar Reporte de Gastos
 * 
 * Responsabilidades:
 * 1. Buscar el evento por ID
 * 2. Validar que existe y tiene gastos
 * 3. Cambiar estado a "completado"
 * 4. Generar reporte (Excel o PDF)
 * 5. Enviar correo con reporte adjunto
 * 6. Retornar confirmación
 */
@ApplicationScoped
public class EnviarReporteGastosUseCase {
    
    private static final Logger LOG = Logger.getLogger(EnviarReporteGastosUseCase.class);
    
    @Inject
    EventoRepository eventoRepository;
    
    @Inject
    GastoRepository gastoRepository;
    
    @Inject
    ReporteGeneratorPort reporteGenerator;
    
    @Inject
    EmailSenderPort emailSender;
    
    /**
     * Ejecuta el envío de reporte de gastos
     * 
     * @param idEvento ID del evento a finalizar
     * @param request Datos para el envío del reporte
     * @return Respuesta con confirmación del envío
     */
    @Transactional
    public EnviarReporteResponse execute(Long idEvento, EnviarReporteRequest request) {
        
        LOG.infof("Iniciando envío de reporte para evento %d", idEvento);
        
        // 1. Buscar evento
        Evento evento = eventoRepository.findByIdEvento(idEvento)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Evento no encontrado con ID: " + idEvento
                ));
        
        // 2. Obtener gastos del evento
        List<Gasto> gastos = gastoRepository.findByEvento(evento);
        
        if (gastos.isEmpty()) {
            LOG.warnf("El evento %d no tiene gastos registrados", idEvento);
            return EnviarReporteResponse.error(
                "No se puede enviar el reporte: el evento no tiene gastos registrados"
            );
        }
        
        LOG.infof("Evento %d tiene %d gastos", idEvento, gastos.size());
        
        // 3. Cambiar estado del evento a "completado"
        evento.setEstado("completado");
        eventoRepository.update(evento);
        
        LOG.infof("Evento %d marcado como completado", idEvento);
        
        // 4. Generar reporte según formato solicitado
        ByteArrayOutputStream reporteStream;
        String contentType;
        String extension;
        
        if ("EXCEL".equalsIgnoreCase(request.formato())) {
            reporteStream = reporteGenerator.generarReporteExcel(evento, gastos);
            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            extension = ".xlsx";
        } else { // PDF
            reporteStream = reporteGenerator.generarReportePDF(evento, gastos);
            contentType = "application/pdf";
            extension = ".pdf";
        }
        
        // 5. Preparar datos del correo
        String asunto = request.generarAsunto();
        String nombreArchivo = String.format(
            "Reporte_Gastos_%s_%s%s",
            evento.getNombreEvento().replaceAll("\\s+", "_"),
            idEvento,
            extension
        );
        
        String cuerpoCorreo = generarCuerpoCorreo(evento, gastos.size(), request.codigoPais());
        
        // 6. Enviar correo
        try {
            emailSender.enviarConAdjunto(
                request.emailDestino(),
                asunto,
                cuerpoCorreo,
                nombreArchivo,
                reporteStream.toByteArray(),
                contentType
            );
            
            LOG.infof("Reporte enviado exitosamente a %s", request.emailDestino());
            
            return EnviarReporteResponse.success(
                request.emailDestino(),
                asunto,
                request.formato(),
                gastos.size()
            );
            
        } catch (Exception e) {
            LOG.errorf(e, "Error al enviar correo para evento %d", idEvento);
            
            // Revertir estado si falla el envío
            evento.setEstado("activo");
            eventoRepository.update(evento);
            
            return EnviarReporteResponse.error(
                "Error al enviar el correo: " + e.getMessage()
            );
        }
    }
    
    /**
     * Genera el cuerpo del correo electrónico
     */
    private String generarCuerpoCorreo(Evento evento, int cantidadGastos, String codigoPais) {
        String empleadoNombre = evento.getEmpleado() != null 
            ? evento.getEmpleado().getNombreCompleto()
            : "Sin asignar";
        
        return String.format("""
            <html>
            <body>
                <h2>Reporte de Gastos - %s</h2>
                <p><strong>País:</strong> %s</p>
                <p><strong>Empleado:</strong> %s</p>
                <p><strong>Fecha de Registro:</strong> %s</p>
                <p><strong>Cantidad de Gastos:</strong> %d</p>
                <hr>
                <p>Adjunto encontrará el detalle completo de los gastos registrados.</p>
                <br>
                <p><em>Este es un correo automático generado por Datum Travels.</em></p>
            </body>
            </html>
            """,
            evento.getNombreEvento(),
            codigoPais.toUpperCase(),
            empleadoNombre,
            evento.getFechaRegistro(),
            cantidadGastos
        );
    }
}
