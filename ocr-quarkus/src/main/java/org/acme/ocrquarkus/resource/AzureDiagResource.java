package org.acme.ocrquarkus.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.ocrquarkus.service.AzureStorageService;

@Path("/api/storage")
@Produces(MediaType.APPLICATION_JSON)
public class AzureDiagResource {

    @Inject
    AzureStorageService storage;

    @GET
    @Path("/ping")
    public Response ping() {
        try {
            String name = "diag/test-" + java.util.UUID.randomUUID() + ".txt";
            byte[] data = ("hello azure " + java.time.Instant.now()).getBytes();
            String url = storage.upload(name,
                    new java.io.ByteArrayInputStream(data),
                    data.length,
                    "text/plain");

            // Opcional: SAS temporal 10 min
            String sas = storage.buildReadSasUrl(name, 10);

            return Response.ok(java.util.Map.of(
                    "uploaded", true,
                    "blobName", name,
                    "blobUrl", url,
                    "sasUrl10min", sas
            )).build();
        } catch (Exception e) {
            return Response.serverError().entity(java.util.Map.of(
                    "uploaded", false,
                    "error", e.getMessage()
            )).build();
        }
    }

    @GET
    @Path("/list")
    public Response list() {
        return Response.ok(storage.list()).build();
    }
}
