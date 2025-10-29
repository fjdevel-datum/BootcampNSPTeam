# Script para probar la conexión Backend <-> Keycloak
# ════════════════════════════════════════════════════════════

Write-Host "🔍 PRUEBA DE INTEGRACIÓN BACKEND-KEYCLOAK" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar que Keycloak esté corriendo
Write-Host "1️⃣ Verificando Keycloak..." -ForegroundColor Yellow
try {
    $keycloakHealth = Invoke-WebRequest -Uri "http://localhost:8180/realms/datum-travels" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Keycloak ACTIVO (Status: $($keycloakHealth.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Keycloak NO RESPONDE" -ForegroundColor Red
    Write-Host "   Ejecuta: docker-compose -f docker-compose-dev.yml up -d" -ForegroundColor Yellow
    exit 1
}

# 2. Verificar que Backend esté corriendo
Write-Host ""
Write-Host "2️⃣ Verificando Backend..." -ForegroundColor Yellow
try {
    $backendHealth = Invoke-WebRequest -Uri "http://localhost:8081/q/health" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Backend ACTIVO (Status: $($backendHealth.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend NO RESPONDE" -ForegroundColor Red
    Write-Host "   Ejecuta: cd BackEnd/quarkus-api && .\mvnw.cmd quarkus:dev" -ForegroundColor Yellow
    exit 1
}

# 3. Obtener token de prueba desde Keycloak
Write-Host ""
Write-Host "3️⃣ Obteniendo token JWT de carlos.martinez..." -ForegroundColor Yellow
$body = @{
    grant_type = "password"
    client_id = "datum-app"
    username = "carlos.martinez"
    password = "carlos123"
} | ConvertTo-Json

try {
    $tokenResponse = Invoke-RestMethod -Uri "http://localhost:8180/realms/datum-travels/protocol/openid-connect/token" `
        -Method POST `
        -ContentType "application/x-www-form-urlencoded" `
        -Body "grant_type=password&client_id=datum-app&username=carlos.martinez&password=carlos123"
    
    $accessToken = $tokenResponse.access_token
    Write-Host "   ✅ Token JWT obtenido" -ForegroundColor Green
    Write-Host "   Token (primeros 50 chars): $($accessToken.Substring(0, 50))..." -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Error al obtener token" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. Probar endpoint de sincronización
Write-Host ""
Write-Host "4️⃣ Probando sincronización (POST /api/user/sync)..." -ForegroundColor Yellow
try {
    $syncResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/user/sync" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $accessToken"
            "Content-Type" = "application/json"
        }
    
    Write-Host "   ✅ SINCRONIZACIÓN EXITOSA" -ForegroundColor Green
    Write-Host "   Respuesta:" -ForegroundColor Gray
    Write-Host "   - Success: $($syncResponse.success)" -ForegroundColor Gray
    Write-Host "   - Message: $($syncResponse.message)" -ForegroundColor Gray
    Write-Host "   - ID Empleado: $($syncResponse.idEmpleado)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Error en sincronización" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Mostrar más detalles si hay
    if ($_.ErrorDetails.Message) {
        Write-Host "   Detalles: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# 5. Probar listar eventos
Write-Host ""
Write-Host "5️⃣ Probando listar eventos (GET /api/eventos)..." -ForegroundColor Yellow
try {
    $eventosResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/eventos" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $accessToken"
            "Content-Type" = "application/json"
        }
    
    Write-Host "   ✅ EVENTOS OBTENIDOS" -ForegroundColor Green
    Write-Host "   Total de eventos: $($eventosResponse.Count)" -ForegroundColor Gray
    
    if ($eventosResponse.Count -gt 0) {
        Write-Host "   Primer evento:" -ForegroundColor Gray
        Write-Host "   - ID: $($eventosResponse[0].id)" -ForegroundColor Gray
        Write-Host "   - Descripción: $($eventosResponse[0].descripcion)" -ForegroundColor Gray
        Write-Host "   - Estado: $($eventosResponse[0].estado)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Error al listar eventos" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🏁 PRUEBA COMPLETADA" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
