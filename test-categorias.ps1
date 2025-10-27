# ============================================
# Script: Probar Endpoint de Categorías
# Descripción: Hace una petición GET al endpoint de categorías
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Probando Endpoint de Categorías" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# URL del endpoint
$endpoint = "http://localhost:8081/api/categorias"

Write-Host "Endpoint: $endpoint" -ForegroundColor Yellow
Write-Host ""

try {
    Write-Host "Enviando petición GET..." -ForegroundColor Green
    
    $response = Invoke-RestMethod -Uri $endpoint -Method Get -ContentType "application/json"
    
    Write-Host "✅ Respuesta recibida:" -ForegroundColor Green
    Write-Host ""
    
    $response | ConvertTo-Json -Depth 3 | Write-Host
    
    Write-Host ""
    Write-Host "Total de categorías: $($response.Count)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error al hacer la petición:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        Write-Host ""
        Write-Host "Código de estado: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
