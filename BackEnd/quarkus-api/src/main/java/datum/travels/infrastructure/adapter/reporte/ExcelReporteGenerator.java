package datum.travels.infrastructure.adapter.reporte;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.common.StorageSharedKeyCredential;
import datum.travels.application.port.output.ReporteGeneratorPort;
import datum.travels.domain.model.Evento;
import datum.travels.domain.model.Gasto;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.util.IOUtils;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Implementación del generador de reportes usando Apache POI para Excel
 */
@ApplicationScoped
public class ExcelReporteGenerator implements ReporteGeneratorPort {
    
    private static final Logger LOG = Logger.getLogger(ExcelReporteGenerator.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    
    @ConfigProperty(name = "azure.storage.account-name")
    String azureAccountName;
    
    @ConfigProperty(name = "azure.storage.account-key")
    String azureAccountKey;
    
    @ConfigProperty(name = "azure.storage.container-name")
    String azureContainerName;
    
    @Override
    public ByteArrayOutputStream generarReporteExcel(Evento evento, List<Gasto> gastos) {
        LOG.infof("Generando reporte Excel para evento %d", evento.getIdEvento());
        
        try (Workbook workbook = new XSSFWorkbook()) {
            
            // Crear hoja
            Sheet sheet = workbook.createSheet("Reporte de Gastos");
            
            // Estilos
            CellStyle headerStyle = crearEstiloEncabezado(workbook);
            CellStyle moneyStyle = crearEstiloMoneda(workbook);
            
            int rowNum = 0;
            
            // Título del reporte
            Row titleRow = sheet.createRow(rowNum++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("REPORTE DE GASTOS - DATUM TRAVELS");
            titleCell.setCellStyle(headerStyle);
            
            rowNum++; // Línea en blanco
            
            // Información del evento
            rowNum = crearSeccionEvento(sheet, rowNum, evento);
            rowNum++; // Línea en blanco
            
            // Encabezados de gastos
            rowNum = crearEncabezadosGastos(sheet, rowNum, headerStyle);
            
            // Datos de gastos
            BigDecimal totalUSD = BigDecimal.ZERO;
            int gastoRowIndex = 0;
            
            for (Gasto gasto : gastos) {
                Row row = sheet.createRow(rowNum);
                
                // Ajustar altura de fila para que quepa la imagen (80 píxeles aprox)
                row.setHeightInPoints(80);
                
                row.createCell(0).setCellValue(gasto.getIdGasto());
                
                Cell fechaCell = row.createCell(1);
                if (gasto.getFecha() != null) {
                    fechaCell.setCellValue(gasto.getFecha().format(DATE_FORMATTER));
                }
                
                row.createCell(2).setCellValue(
                    gasto.getCategoria() != null ? gasto.getCategoria().nombreCategoria : ""
                );
                row.createCell(3).setCellValue(gasto.getDescripcion() != null ? gasto.getDescripcion() : "");
                row.createCell(4).setCellValue(gasto.getLugar() != null ? gasto.getLugar() : "");
                
                // Monto original
                Cell montoCell = row.createCell(5);
                if (gasto.getMonto() != null) {
                    montoCell.setCellValue(gasto.getMonto().doubleValue());
                    montoCell.setCellStyle(moneyStyle);
                }
                
                row.createCell(6).setCellValue(gasto.getMoneda() != null ? gasto.getMoneda() : "USD");
                
                // Monto en USD
                Cell montoUsdCell = row.createCell(7);
                if (gasto.getMontoUsd() != null) {
                    montoUsdCell.setCellValue(gasto.getMontoUsd().doubleValue());
                    montoUsdCell.setCellStyle(moneyStyle);
                    totalUSD = totalUSD.add(gasto.getMontoUsd());
                }
                
                // Número de tarjeta enmascarado (solo últimos 4 dígitos visibles)
                String numeroTarjetaMasked = gasto.getTarjeta() != null 
                    ? enmascararNumeroTarjeta(gasto.getTarjeta().numeroTarjeta) 
                    : "N/A";
                row.createCell(8).setCellValue(numeroTarjetaMasked);
                
                // Agregar imagen del comprobante
                if (gasto.getBlobUrl() != null && !gasto.getBlobUrl().isEmpty()) {
                    try {
                        insertarImagenComprobante(workbook, sheet, gasto.getBlobUrl(), rowNum, 9);
                    } catch (Exception e) {
                        LOG.warnf(e, "No se pudo insertar imagen para gasto %d: %s", 
                            gasto.getIdGasto(), e.getMessage());
                        row.createCell(9).setCellValue("Error al cargar imagen");
                    }
                } else {
                    row.createCell(9).setCellValue("Sin imagen");
                }
                
                rowNum++;
                gastoRowIndex++;
            }
            
            rowNum++; // Línea en blanco
            
            // Total
            Row totalRow = sheet.createRow(rowNum);
            Cell totalLabelCell = totalRow.createCell(6);
            totalLabelCell.setCellValue("TOTAL USD:");
            totalLabelCell.setCellStyle(headerStyle);
            
            Cell totalValueCell = totalRow.createCell(7);
            totalValueCell.setCellValue(totalUSD.doubleValue());
            totalValueCell.setCellStyle(moneyStyle);
            
            // Ajustar anchos de columnas
            for (int i = 0; i < 9; i++) {
                sheet.autoSizeColumn(i);
            }
            // Columna de imagen más ancha (80 píxeles aprox)
            sheet.setColumnWidth(9, 80 * 256);
            
            // Escribir a ByteArrayOutputStream
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            
            LOG.infof("Reporte Excel generado: %d gastos, total USD: %s", 
                gastos.size(), totalUSD);
            
            return outputStream;
            
        } catch (IOException e) {
            LOG.errorf(e, "Error al generar reporte Excel para evento %d", evento.getIdEvento());
            throw new RuntimeException("Error al generar reporte Excel", e);
        }
    }
    
    @Override
    public ByteArrayOutputStream generarReportePDF(Evento evento, List<Gasto> gastos) {
        // Por ahora, delegamos a Excel hasta implementar PDF con otra librería
        LOG.warn("Generación de PDF no implementada, usando Excel");
        return generarReporteExcel(evento, gastos);
    }
    
    private int crearSeccionEvento(Sheet sheet, int startRow, Evento evento) {
        int rowNum = startRow;
        
        crearFilaInfo(sheet, rowNum++, "Evento:", evento.getNombreEvento());
        crearFilaInfo(sheet, rowNum++, "Empleado:", 
            evento.getEmpleado() != null ? evento.getEmpleado().getNombreCompleto() : "N/A");
        crearFilaInfo(sheet, rowNum++, "Fecha Registro:", 
            evento.getFechaRegistro() != null ? evento.getFechaRegistro().format(DATE_FORMATTER) : "N/A");
        crearFilaInfo(sheet, rowNum++, "Estado:", evento.getEstado());
        
        return rowNum;
    }
    
    private void crearFilaInfo(Sheet sheet, int rowNum, String label, String value) {
        Row row = sheet.createRow(rowNum);
        row.createCell(0).setCellValue(label);
        row.createCell(1).setCellValue(value);
    }
    
    private int crearEncabezadosGastos(Sheet sheet, int rowNum, CellStyle headerStyle) {
        Row headerRow = sheet.createRow(rowNum);
        
        String[] headers = {
            "ID", "Fecha", "Categoría", "Descripción", "Lugar", 
            "Monto", "Moneda", "Monto USD", "Tarjeta", "Comprobante"
        };
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        return rowNum + 1;
    }
    
    private CellStyle crearEstiloEncabezado(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }
    
    private CellStyle crearEstiloMoneda(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("$#,##0.00"));
        return style;
    }
    
    /**
     * Descarga una imagen desde Azure Blob Storage usando credenciales y la inserta en el Excel
     * @param workbook El workbook de Excel
     * @param sheet La hoja donde insertar la imagen
     * @param imageUrl URL de Azure Blob Storage
     * @param rowIndex Índice de la fila
     * @param colIndex Índice de la columna
     */
    private void insertarImagenComprobante(Workbook workbook, Sheet sheet, String imageUrl, int rowIndex, int colIndex) throws IOException {
        InputStream inputStream = null;
        try {
            LOG.infof("Descargando imagen desde Azure: %s", imageUrl);
            
            // Extraer el nombre del blob desde la URL
            // URL ejemplo: https://storageocr2025.blob.core.windows.net/ocr-files/gastos%2FAna%20Rodriguez%2F...
            String blobName = extraerNombreBlob(imageUrl);
            
            // Crear cliente de Azure con credenciales
            StorageSharedKeyCredential credential = new StorageSharedKeyCredential(azureAccountName, azureAccountKey);
            String endpoint = String.format("https://%s.blob.core.windows.net", azureAccountName);
            
            BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                .endpoint(endpoint)
                .credential(credential)
                .buildClient();
            
            BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(azureContainerName);
            BlobClient blobClient = containerClient.getBlobClient(blobName);
            
            // Descargar el blob
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            blobClient.downloadStream(outputStream);
            byte[] imageBytes = outputStream.toByteArray();
            
            LOG.infof("Imagen descargada: %d bytes", imageBytes.length);
            
            // Siempre usar JPEG para .jfif y variantes de JPEG
            int pictureType = determinarTipoImagen(imageUrl);
            
            // Agregar imagen al workbook
            int pictureIdx = workbook.addPicture(imageBytes, pictureType);
            
            // Crear objeto de dibujo
            Drawing<?> drawing = sheet.createDrawingPatriarch();
            CreationHelper helper = workbook.getCreationHelper();
            
            // Crear ancla para posicionar la imagen
            ClientAnchor anchor = helper.createClientAnchor();
            
            // Configurar posición de la imagen
            anchor.setCol1(colIndex);      // Columna inicio
            anchor.setRow1(rowIndex);      // Fila inicio
            anchor.setCol2(colIndex + 1);  // Columna fin
            anchor.setRow2(rowIndex + 1);  // Fila fin
            
            // Ajustar márgenes (padding interno)
            anchor.setDx1(20);  // Margen izquierdo
            anchor.setDy1(20);  // Margen superior
            anchor.setDx2(-20); // Margen derecho
            anchor.setDy2(-20); // Margen inferior
            
            // Insertar imagen
            Picture picture = drawing.createPicture(anchor, pictureIdx);
            
            LOG.infof("Imagen insertada exitosamente en fila %d, columna %d", rowIndex, colIndex);
            
        } catch (Exception e) {
            LOG.errorf(e, "Error al descargar/insertar imagen desde %s: %s", imageUrl, e.getMessage());
            throw new IOException("Error al procesar imagen: " + e.getMessage(), e);
        } finally {
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (IOException e) {
                    LOG.warn("Error al cerrar InputStream de imagen", e);
                }
            }
        }
    }
    
    /**
     * Extrae el nombre del blob desde una URL de Azure
     * Ejemplo: https://storageocr2025.blob.core.windows.net/ocr-files/gastos%2FAna%20Rodriguez%2Finvoice.jfif
     * Retorna: gastos/Ana Rodriguez/invoice.jfif (decodificado)
     */
    private String extraerNombreBlob(String url) {
        try {
            // Extraer la parte después del nombre del contenedor
            String[] parts = url.split("/" + azureContainerName + "/");
            if (parts.length > 1) {
                // Decodificar URL encoding (%20 -> espacio, %2F -> /)
                return java.net.URLDecoder.decode(parts[1], "UTF-8");
            }
            throw new IllegalArgumentException("URL de Azure mal formada: " + url);
        } catch (Exception e) {
            LOG.errorf(e, "Error al extraer nombre de blob desde URL: %s", url);
            throw new RuntimeException("Error al procesar URL de Azure", e);
        }
    }
    
    /**
     * Determina el tipo de imagen según la extensión del archivo
     */
    private int determinarTipoImagen(String imageUrl) {
        String urlLower = imageUrl.toLowerCase();
        
        if (urlLower.endsWith(".png")) {
            return Workbook.PICTURE_TYPE_PNG;
        } else {
            // Por defecto usamos JPEG para .jpg, .jpeg, .jfif, .jpe y cualquier otro formato
            // JFIF es el formato estándar usado por cámaras de celulares
            // Apache POI solo soporta PNG, JPEG, EMF, WMF, PICT, DIB
            return Workbook.PICTURE_TYPE_JPEG;
        }
    }
    
    /**
     * Enmascara el número de tarjeta mostrando solo los últimos 4 dígitos
     * Ejemplo: 4020-3344-5566-7788 → XXXX-XXXX-XXXX-7788
     * Ejemplo: 4020334455667788 → XXXXXXXXXXXX7788
     * 
     * @param numeroTarjeta El número completo de la tarjeta
     * @return El número enmascarado con X
     */
    private String enmascararNumeroTarjeta(String numeroTarjeta) {
        if (numeroTarjeta == null || numeroTarjeta.isEmpty()) {
            return "N/A";
        }
        
        // Limpiar cualquier espacio o guión
        String tarjetaLimpia = numeroTarjeta.replaceAll("[\\s-]", "");
        
        // Si tiene menos de 4 caracteres, enmascarar todo
        if (tarjetaLimpia.length() <= 4) {
            return "XXXX";
        }
        
        // Obtener los últimos 4 dígitos
        String ultimos4 = tarjetaLimpia.substring(tarjetaLimpia.length() - 4);
        
        // Contar cuántos caracteres enmascarar
        int caracteresAEnmascarar = tarjetaLimpia.length() - 4;
        
        // Si la tarjeta original tenía guiones (formato XXXX-XXXX-XXXX-7788)
        if (numeroTarjeta.contains("-")) {
            // Formato con guiones: XXXX-XXXX-XXXX-7788
            StringBuilder masked = new StringBuilder();
            int gruposCompletos = caracteresAEnmascarar / 4;
            
            // Agregar grupos de XXXX con guiones
            for (int i = 0; i < gruposCompletos; i++) {
                masked.append("XXXX");
                if (i < gruposCompletos - 1 || caracteresAEnmascarar % 4 != 0) {
                    masked.append("-");
                }
            }
            
            // Si hay caracteres restantes (no múltiplo de 4)
            int resto = caracteresAEnmascarar % 4;
            if (resto > 0) {
                masked.append("X".repeat(resto)).append("-");
            }
            
            // Agregar últimos 4 dígitos
            if (gruposCompletos > 0) {
                masked.append("-");
            }
            masked.append(ultimos4);
            
            return masked.toString();
        } else {
            // Formato sin guiones: XXXXXXXXXXXX7788
            return "X".repeat(caracteresAEnmascarar) + ultimos4;
        }
    }
}
