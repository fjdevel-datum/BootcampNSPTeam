package datum.travels.infrastructure.adapter.reporte;

import datum.travels.application.port.output.ReporteGeneratorPort;
import datum.travels.domain.model.Evento;
import datum.travels.domain.model.Gasto;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.jboss.logging.Logger;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
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
            
            for (Gasto gasto : gastos) {
                Row row = sheet.createRow(rowNum++);
                
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
                
                row.createCell(8).setCellValue(
                    gasto.getTarjeta() != null ? gasto.getTarjeta().numeroTarjeta : "N/A"
                );
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
            "Monto", "Moneda", "Monto USD", "Tarjeta"
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
}
