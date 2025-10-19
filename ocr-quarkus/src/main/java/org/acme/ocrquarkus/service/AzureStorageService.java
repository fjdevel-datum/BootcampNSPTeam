package org.acme.ocrquarkus.service;

import com.azure.storage.blob.*;
import com.azure.storage.blob.models.*;
import com.azure.storage.blob.sas.BlobSasPermission;
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues;
import com.azure.storage.common.StorageSharedKeyCredential;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.InputStream;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.StreamSupport;

@ApplicationScoped
public class AzureStorageService {

    private final String accountName;
    private final BlobContainerClient containerClient;
    private final StorageSharedKeyCredential credential;

    public AzureStorageService(
            @ConfigProperty(name = "azure.storage.account-name") String accountName,
            @ConfigProperty(name = "azure.storage.account-key") String accountKey,
            @ConfigProperty(name = "azure.storage.container-name") String containerName
    ) {
        this.accountName = accountName;
        this.credential = new StorageSharedKeyCredential(accountName, accountKey);

        String endpoint = String.format("https://%s.blob.core.windows.net", accountName);

        BlobServiceClient service = new BlobServiceClientBuilder()
                .endpoint(endpoint)
                .credential(credential)
                .buildClient();

        BlobContainerClient c = service.getBlobContainerClient(containerName);
        if (!c.exists()) c = service.createBlobContainer(containerName);
        this.containerClient = c;
    }

    public String upload(String blobName, InputStream data, long length, String contentType) {
        BlobClient blob = containerClient.getBlobClient(blobName);
        blob.upload(data, length, true);
        if (contentType != null && !contentType.isBlank()) {
            blob.setHttpHeaders(new BlobHttpHeaders().setContentType(contentType));
        }
        return blob.getBlobUrl(); // no pública si el contenedor es privado
    }

    public byte[] download(String blobName) throws Exception {
        BlobClient blob = containerClient.getBlobClient(blobName);
        try (var out = new java.io.ByteArrayOutputStream()) {
            blob.download(out);
            return out.toByteArray();
        }
    }

    public boolean delete(String blobName) {
        return containerClient.getBlobClient(blobName).deleteIfExists();
    }

    public List<String> list() {
        return StreamSupport.stream(containerClient.listBlobs().spliterator(), false)
                .map(BlobItem::getName)
                .toList();
    }

    /** SAS de solo lectura por N minutos (útil para frontends). */
    public String buildReadSasUrl(String blobName, int minutes) {
        BlobClient blob = containerClient.getBlobClient(blobName);

        BlobSasPermission perm = new BlobSasPermission().setReadPermission(true);
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime exp = now.plusMinutes(Math.max(minutes, 1));

        BlobServiceSasSignatureValues values = new BlobServiceSasSignatureValues(exp, perm)
                .setStartTime(now)
                .setContentDisposition("inline");

        String sas = blob.generateSas(values);
        // https://<account>.blob.core.windows.net/<container>/<blob>?<sas>
        return blob.getBlobUrl() + "?" + sas;
    }
}