# Script de prueba para envío de reportes de gastos
# Ejecutar: .\test-enviar-reporte.ps1

$baseUrl = "http://localhost:8081"
$eventoId = 1  # Cambiar por un ID de evento válido que tenga gastos

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  PRUEBA: Envío de Reporte de Gastos" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# ============================================
# 1. Listar destinatarios disponibles
# ============================================
Write-Host "1. Obteniendo lista de destinatarios..." -ForegroundColor Yellow

try {
    $destinatarios = Invoke-RestMethod -Uri "$baseUrl/api/reportes/destinatarios" -Method GET
    
    Write-Host "`n✅ Destinatarios disponibles:" -ForegroundColor Green
    $destinatarios | ForEach-Object {
        Write-Host "   [$($_.codigoPais)] $($_.nombrePais) - $($_.email)" -ForegroundColor White
    }
} catch {
    Write-Host "`n❌ Error al obtener destinatarios: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ============================================
# 2. Seleccionar destinatario (ejemplo: Guatemala)
# ============================================
$destinatarioSeleccionado = $destinatarios | Where-Object { $_.codigoPais -eq "GT" } | Select-Object -First 1

if (-not $destinatarioSeleccionado) {
    Write-Host "`n❌ No se encontró destinatario para Guatemala" -ForegroundColor Red
    exit 1
}

Write-Host "`n2. Destinatario seleccionado:" -ForegroundColor Yellow
Write-Host "   $($destinatarioSeleccionado.nombrePais) - $($destinatarioSeleccionado.email)" -ForegroundColor White

# ============================================
# 3. Preparar solicitud de envío
# ============================================
$requestBody = @{
    emailDestino = $destinatarioSeleccionado.email
    codigoPais = $destinatarioSeleccionado.codigoPais
    nombreProveedor = "SUBWAY DE GUATEMALA"
    formato = "EXCEL"  # Cambiar a "PDF" si se desea
} | ConvertTo-Json

Write-Host "`n3. Preparando envío de reporte..." -ForegroundColor Yellow
Write-Host "   Evento ID: $eventoId" -ForegroundColor White
Write-Host "   Formato: EXCEL" -ForegroundColor White
Write-Host "   Proveedor: SUBWAY DE GUATEMALA" -ForegroundColor White

# ============================================
# 4. Enviar reporte
# ============================================
Write-Host "`n4. Enviando reporte..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/eventos/$eventoId/enviar-reporte" `
        -Method POST `
        -Body $requestBody `
        -ContentType "application/json"
    
    # ============================================
    # 5. Mostrar resultado
    # ============================================
    Write-Host "`n============================================" -ForegroundColor Cyan
    Write-Host "  RESULTADO DEL ENVÍO" -ForegroundColor Cyan
    Write-Host "============================================`n" -ForegroundColor Cyan
    
    if ($response.exitoso) {
        Write-Host "✅ $($response.mensaje)" -ForegroundColor Green
        Write-Host "`nDetalles:" -ForegroundColor Yellow
        Write-Host "   Destinatario: $($response.emailDestino)" -ForegroundColor White
        Write-Host "   Asunto: $($response.asunto)" -ForegroundColor White
        Write-Host "   Formato: $($response.formato)" -ForegroundColor White
        Write-Host "   Gastos incluidos: $($response.cantidadGastos)" -ForegroundColor White
        
        Write-Host "`n💡 Si MAILER_MOCK=true, el correo NO se envió realmente." -ForegroundColor Cyan
        Write-Host "   Revisar logs del backend para ver el correo simulado." -ForegroundColor Cyan
    } else {
        Write-Host "❌ Error: $($response.mensaje)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "`n❌ Error al enviar reporte:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 404) {
            Write-Host "`n💡 El evento con ID $eventoId no existe." -ForegroundColor Yellow
            Write-Host "   Cambiar la variable `$eventoId por un ID válido." -ForegroundColor Yellow
        }
    }
}

Write-Host "`n============================================`n" -ForegroundColor Cyan
