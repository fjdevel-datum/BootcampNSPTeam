package org.acme.ocrquarkus;

import org.jboss.resteasy.annotations.providers.multipart.PartType;
import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.core.MediaType;

public class UploadForm {
    @FormParam("file")
    @PartType("application/octet-stream")
    public byte[] file;


    // 🔹 Nuevo: nombre del archivo que se guardará en Azure
    @FormParam("filename")
    @PartType(MediaType.TEXT_PLAIN)
    public String filename;

    // 🔹 Nuevo: tipo MIME del archivo (image/png, application/pdf, etc.)
    @FormParam("contentType")
    @PartType(MediaType.TEXT_PLAIN)
    public String contentType;
}