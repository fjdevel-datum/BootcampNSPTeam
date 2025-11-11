package org.acme.ocrquarkus;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.resteasy.annotations.providers.multipart.MultipartForm;

@Path("/api/ocr")
public class OcrResource {

    @Inject
    OcrService ocrService;

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public String analyze(@MultipartForm UploadForm form) {
        if (form == null || form.file == null || form.file.length == 0) {
            throw new BadRequestException("No file was received for OCR processing.");
        }

        try {
            return ocrService.ocr(form.file);
        } catch (WebApplicationException e) {
            throw e;
        } catch (Exception e) {
            String message = e.getMessage();
            if (message == null || message.isBlank()) {
                message = "Unexpected error while processing the image.";
            }
            Response response = Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(message)
                    .type(MediaType.TEXT_PLAIN_TYPE)
                    .build();
            throw new WebApplicationException(response);
        }
    }
}
