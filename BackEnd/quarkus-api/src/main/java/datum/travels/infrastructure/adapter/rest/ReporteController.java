package datum.travels.infrastructure.adapter.rest;

import datum.travels.application.dto.reporte.DestinatarioReporteDTO;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.ArrayList;
import java.util.List;

/**
 * Controlador REST para endpoints de reportes de gastos
 * 
 * Endpoints:
 * - GET /api/reportes/destinatarios → Listar destinatarios disponibles por país
 */
@Path("/api/reportes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Reportes", description = "Gestión de reportes de gastos")
public class ReporteController {
    
    @ConfigProperty(name = "app.email.proveedores.sv")
    String emailSV;
    
    @ConfigProperty(name = "app.email.proveedores.gt")
    String emailGT;
    
    @ConfigProperty(name = "app.email.proveedores.hn")
    String emailHN;
    
    @ConfigProperty(name = "app.email.proveedores.pa")
    String emailPA;
    
    @ConfigProperty(name = "app.email.proveedores.cr")
    String emailCR;
    
    /**
     * GET /api/reportes/destinatarios
     * Obtiene la lista de destinatarios disponibles para reportes
     */
    @GET
    @Path("/destinatarios")
    @Operation(
        summary = "Listar destinatarios", 
        description = "Obtiene la lista de correos de proveedores por país para envío de reportes"
    )
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Lista de destinatarios obtenida exitosamente")
    })
    public List<DestinatarioReporteDTO> listarDestinatarios() {
        List<DestinatarioReporteDTO> destinatarios = new ArrayList<>();
        
        destinatarios.add(new DestinatarioReporteDTO("SV", "El Salvador", emailSV));
        destinatarios.add(new DestinatarioReporteDTO("GT", "Guatemala", emailGT));
        destinatarios.add(new DestinatarioReporteDTO("HN", "Honduras", emailHN));
        destinatarios.add(new DestinatarioReporteDTO("PA", "Panamá", emailPA));
        destinatarios.add(new DestinatarioReporteDTO("CR", "Costa Rica", emailCR));
        
        return destinatarios;
    }
}
