package org.acme.ocrquarkus.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.acme.ocrquarkus.UploadForm;
import org.acme.ocrquarkus.entity.Gasto;
import org.acme.ocrquarkus.repository.GastoRepository;
import org.acme.ocrquarkus.service.GastoService;
import org.jboss.resteasy.annotations.providers.multipart.MultipartForm;
import org.eclipse.microprofile.jwt.JsonWebToken;

@Path("/api/gastos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GastoResource {

    @Inject
    GastoService gastoService;

    @Inject
    GastoRepository gastoRepository;

    @Inject
    JsonWebToken jwt;

    @GET
    public Response list() {
        try {
            List<Gasto> all = gastoRepository.listAll();
            List<Map<String, Object>> out = new ArrayList<>();
            for (Gasto g : all) {
                Map<String, Object> m = new HashMap<>();
                m.put("id", g.idGasto);
                m.put("id_gasto", g.idGasto);
                m.put("descripcion", g.descripcion);
                m.put("lugar", g.lugar);
                m.put("fecha", g.fecha != null ? g.fecha.toString() : null);
                m.put("monto", g.monto);
                m.put("idEvento", g.idEvento);
                m.put("idTarjeta", g.idTarjeta);
                m.put("openkmDocUuid", g.getOpenkmDocUuid());
                String readUrl = null;
                try {
                    if (g.getBlobName() != null) {
                        readUrl = gastoService.buildTempReadUrl(g.idGasto, 60);
                    }
                } catch (Exception ignored) {
                }
                m.put("readUrl", readUrl);
                out.add(m);
            }
            return Response.ok(out).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error listando gastos: " + e.getMessage()).build();
        }
    }

    @POST
    @Path("/llm")
    public Response procesarResultadoLLM(String jsonLLM) {
        try {
            Gasto gasto = gastoService.guardarGastoDesdeJson(jsonLLM);
            return Response.ok(Map.of(
                    "id", gasto.idGasto,
                    "id_gasto", gasto.idGasto,
                    "idGasto", gasto.idGasto
            )).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Error procesando el JSON: " + e.getMessage())
                    .build();
        }
    }

    // ===================== Manejo de archivos =====================

    @POST
    @Path("/{id}/archivo")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response uploadFile(@PathParam("id") Long id, @MultipartForm UploadForm form) {
        try {
            if (form == null || form.file == null || form.file.length == 0) {
                throw new BadRequestException("Archivo no proporcionado");
            }

            String filename = (form.filename == null || form.filename.isBlank())
                    ? java.util.UUID.randomUUID() + ".bin"
                    : form.filename;
            String ct = (form.contentType == null || form.contentType.isBlank())
                    ? "application/octet-stream"
                    : form.contentType;

            Gasto g = gastoService.attachFile(id, form.file, filename, ct, resolveCurrentUserName());

            return Response.ok(Map.of(
                    "id", g.idGasto,
                    "blobName", g.getBlobName(),
                    "blobUrl", g.getBlobUrl(),
                    "fileSize", g.getFileSize(),
                    "contentType", g.getFileContentType(),
                    "openkmDocUuid", g.getOpenkmDocUuid()
            )).build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al subir el archivo: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/{id}/archivo")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response downloadFile(@PathParam("id") Long id) {
        try {
            GastoService.FileDownloadResult file = gastoService.downloadFile(id);
            return Response.ok(file.getData())
                    .type(file.getContentType())
                    .header("Content-Disposition", "inline; filename=\"" + file.getFileName() + "\"")
                    .build();
        } catch (NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage()).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al descargar archivo: " + e.getMessage())
                    .build();
        }
    }

    @DELETE
    @Path("/{id}/archivo")
    public Response deleteFile(@PathParam("id") Long id) {
        try {
            boolean deleted = gastoService.removeFile(id);
            return Response.ok(Map.of("deleted", deleted)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al eliminar archivo: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/{id}/archivo/url")
    public Response getTempUrl(@PathParam("id") Long id, @QueryParam("min") @DefaultValue("15") int min) {
        try {
            String url = gastoService.buildTempReadUrl(id, min);
            return Response.ok(Map.of(
                    "readUrl", url,
                    "expiresInMinutes", min
            )).build();
        } catch (NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage()).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error generando URL temporal: " + e.getMessage())
                    .build();
        }
    }

    private String resolveCurrentUserName() {
        if (jwt == null) {
            return null;
        }
        String name = jwt.getClaim("name");
        if (name == null || name.isBlank()) {
            name = jwt.getName();
        }
        return name;
    }
}

