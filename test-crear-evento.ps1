# ========================================
# Script de Prueba: POST /api/eventos
# ========================================
# Este script prueba el endpoint de creación de eventos
# usando PowerShell y el comando Invoke-RestMethod

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TEST: POST /api/eventos - Crear Evento" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Configuración
$API_BASE = "http://localhost:8081"
$ENDPOINT = "$API_BASE/api/eventos"

# Verificar si el backend está corriendo
Write-Host "🔍 Verificando conexión con el backend..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri $API_BASE -Method Get -ErrorAction Stop
    Write-Host "✅ Backend está corriendo en $API_BASE" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: No se puede conectar al backend en $API_BASE" -ForegroundColor Red
    Write-Host "   Asegúrate de que Quarkus esté corriendo con: ./mvnw quarkus:dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# ========================================
# TEST 1: Crear evento SIN idEmpleado (usa simulación)
# ========================================
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "TEST 1: Crear evento sin idEmpleado (usa AuthSimulation)" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor DarkGray

$requestBody1 = @{
    nombreEvento = "VIAJE TEST POWERSHELL"
} | ConvertTo-Json

Write-Host "📤 Request Body:" -ForegroundColor Cyan
Write-Host $requestBody1 -ForegroundColor White

try {
    $response1 = Invoke-RestMethod -Uri $ENDPOINT -Method Post `
        -ContentType "application/json" `
        -Body $requestBody1 `
        -ErrorAction Stop

    Write-Host ""
    Write-Host "✅ Evento creado exitosamente!" -ForegroundColor Green
    Write-Host "📥 Response:" -ForegroundColor Cyan
    $response1 | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Detalles:" -ForegroundColor Cyan
    Write-Host "   ID Evento:      $($response1.idEvento)" -ForegroundColor White
    Write-Host "   ID Empleado:    $($response1.idEmpleado) (de AuthSimulation)" -ForegroundColor White
    Write-Host "   Nombre:         $($response1.nombreEvento)" -ForegroundColor White
    Write-Host "   Fecha:          $($response1.fechaRegistro)" -ForegroundColor White
    Write-Host "   Estado:         $($response1.estado)" -ForegroundColor White
    Write-Host "   Empleado:       $($response1.nombreEmpleado)" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error al crear evento" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""

# ========================================
# TEST 2: Crear evento CON idEmpleado explícito
# ========================================
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "TEST 2: Crear evento con idEmpleado explícito" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor DarkGray

$requestBody2 = @{
    nombreEvento = "VIAJE EXPLÍCITO"
    idEmpleado = 1
} | ConvertTo-Json

Write-Host "📤 Request Body:" -ForegroundColor Cyan
Write-Host $requestBody2 -ForegroundColor White

try {
    $response2 = Invoke-RestMethod -Uri $ENDPOINT -Method Post `
        -ContentType "application/json" `
        -Body $requestBody2 `
        -ErrorAction Stop

    Write-Host ""
    Write-Host "✅ Evento creado exitosamente!" -ForegroundColor Green
    Write-Host "📥 Response:" -ForegroundColor Cyan
    $response2 | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Detalles:" -ForegroundColor Cyan
    Write-Host "   ID Evento:      $($response2.idEvento)" -ForegroundColor White
    Write-Host "   ID Empleado:    $($response2.idEmpleado) (explícito)" -ForegroundColor White
    Write-Host "   Nombre:         $($response2.nombreEvento)" -ForegroundColor White
    Write-Host "   Fecha:          $($response2.fechaRegistro)" -ForegroundColor White
    Write-Host "   Estado:         $($response2.estado)" -ForegroundColor White
    Write-Host "   Empleado:       $($response2.nombreEmpleado)" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error al crear evento" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""

# ========================================
# TEST 3: Verificar formato de fecha
# ========================================
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "TEST 3: Verificar formato de fecha (dd/MM/yyyy)" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor DarkGray

$fechaResponse = $response1.fechaRegistro
$patron = "^\d{2}/\d{2}/\d{4}$"

if ($fechaResponse -match $patron) {
    Write-Host "✅ Formato de fecha correcto: $fechaResponse (dd/MM/yyyy)" -ForegroundColor Green
} else {
    Write-Host "❌ Formato de fecha incorrecto: $fechaResponse" -ForegroundColor Red
    Write-Host "   Esperado: dd/MM/yyyy (ej: 24/10/2025)" -ForegroundColor Yellow
}

Write-Host ""

# ========================================
# TEST 4: Listar todos los eventos
# ========================================
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "TEST 4: Listar todos los eventos (GET /api/eventos)" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor DarkGray

try {
    $eventos = Invoke-RestMethod -Uri $ENDPOINT -Method Get -ErrorAction Stop
    
    Write-Host "✅ Se obtuvieron $($eventos.Count) eventos" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Lista de eventos:" -ForegroundColor Cyan
    
    $eventos | ForEach-Object {
        Write-Host "   • [$($_.idEvento)] $($_.nombreEvento) - $($_.fechaRegistro) - $($_.estado)" -ForegroundColor White
    }
    
} catch {
    Write-Host "❌ Error al listar eventos" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ PRUEBAS COMPLETADAS" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Instrucciones finales
Write-Host "📝 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Abre http://localhost:5173 en tu navegador" -ForegroundColor White
Write-Host "   2. Haz clic en 'Registrar Nuevo Evento'" -ForegroundColor White
Write-Host "   3. Ingresa un nombre (ej: VIAJE MARRUECOS)" -ForegroundColor White
Write-Host "   4. Verifica que aparezca en la lista" -ForegroundColor White
Write-Host ""
