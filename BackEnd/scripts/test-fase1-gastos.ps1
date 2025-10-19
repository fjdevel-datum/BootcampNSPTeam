# ════════════════════════════════════════════════════════════
# TEST - Endpoints de Gastos (FASE 1)
# ════════════════════════════════════════════════════════════

Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         TEST ENDPOINTS - FASE 1 (Gastos)             ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8080/api"

# ═══════════════════════════════════════════════════════════
# TEST 1: Listar Categorías
# ═══════════════════════════════════════════════════════════

Write-Host "📋 TEST 1: GET /api/categorias" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/categorias" -Method Get
    Write-Host "✅ Categorías obtenidas:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
    Write-Host ""
} catch {
    Write-Host "❌ Error al obtener categorías" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
}

# ═══════════════════════════════════════════════════════════
# TEST 2: Crear un gasto
# ═══════════════════════════════════════════════════════════

Write-Host "💰 TEST 2: POST /api/gastos" -ForegroundColor Yellow
Write-Host ""

$nuevoGasto = @{
    idEvento = 1
    idCategoria = 2
    idTarjeta = $null
    lugar = "McDonald's Guatemala"
    descripcion = "Almuerzo día 1"
    fecha = "2025-10-17"
    monto = 45.50
} | ConvertTo-Json

Write-Host "Body enviado:"
Write-Host $nuevoGasto
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/gastos" -Method Post -Body $nuevoGasto -ContentType "application/json"
    Write-Host "✅ Gasto creado exitosamente:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
    Write-Host ""
    
    $idGastoCreado = $response.idGasto
    Write-Host "📝 ID del gasto creado: $idGastoCreado" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host "❌ Error al crear gasto" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host $_.Exception.Message
    Write-Host ""
}

# ═══════════════════════════════════════════════════════════
# TEST 3: Listar gastos del evento
# ═══════════════════════════════════════════════════════════

Write-Host "📊 TEST 3: GET /api/gastos/evento/1" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/gastos/evento/1" -Method Get
    Write-Host "✅ Gastos del evento obtenidos:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
    Write-Host ""
    Write-Host "Total de gastos: $($response.Count)" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "❌ Error al listar gastos" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
}

# ═══════════════════════════════════════════════════════════
# TEST 4: Cambiar estado del evento a "completado"
# ═══════════════════════════════════════════════════════════

Write-Host "🔄 TEST 4: PATCH /api/eventos/1/estado" -ForegroundColor Yellow
Write-Host ""

$cambiarEstado = @{
    estado = "completado"
} | ConvertTo-Json

Write-Host "Body enviado:"
Write-Host $cambiarEstado
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/eventos/1/estado" -Method Patch -Body $cambiarEstado -ContentType "application/json"
    Write-Host "✅ Estado del evento actualizado:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
    Write-Host ""
} catch {
    Write-Host "❌ Error al cambiar estado" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
}

# ═══════════════════════════════════════════════════════════
# RESUMEN
# ═══════════════════════════════════════════════════════════

Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✅ TESTS COMPLETADOS                     ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Endpoints probados:" -ForegroundColor Cyan
Write-Host "  1. GET  /api/categorias" -ForegroundColor White
Write-Host "  2. POST /api/gastos" -ForegroundColor White
Write-Host "  3. GET  /api/gastos/evento/{id}" -ForegroundColor White
Write-Host "  4. PATCH /api/eventos/{id}/estado" -ForegroundColor White
Write-Host ""
