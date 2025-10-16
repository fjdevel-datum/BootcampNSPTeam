package org.acme.ocrquarkus;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.jboss.resteasy.annotations.providers.multipart.MultipartForm;

@Path("/")
public class OcrResource {

    @Inject
    OcrService ocrService;

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public String analyze(@MultipartForm UploadForm form) throws Exception {
        return ocrService.ocr(form.file);
    }
}