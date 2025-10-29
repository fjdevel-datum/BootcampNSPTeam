# ============================================
# Test de Sincronización Keycloak
# ============================================

Write-Host "🧪 Probando sincronización de usuario con Keycloak" -ForegroundColor Cyan
Write-Host ""

# PASO 1: Login
Write-Host "1️⃣ Haciendo login..." -ForegroundColor Yellow

$loginBody = @{
    username = "carlos.martinez"
    password = "TU_PASSWORD_AQUI"  # ← Cambia esto
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:9080/realms/datum-travels/protocol/openid-connect/token" `
        -Method POST `
        -ContentType "application/x-www-form-urlencoded" `
        -Body "grant_type=password&client_id=datum-app&username=carlos.martinez&password=TU_PASSWORD_AQUI"
    
    $accessToken = $response.access_token
    Write-Host "   ✅ Login exitoso" -ForegroundColor Green
    Write-Host ""

    # PASO 2: Sincronizar con backend
    Write-Host "2️⃣ Sincronizando con backend..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $accessToken"
        "Content-Type" = "application/json"
    }

    $syncResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/sync" `
        -Method POST `
        -Headers $headers

    Write-Host "   ✅ Sincronización exitosa:" -ForegroundColor Green
    Write-Host "   ID Empleado: $($syncResponse.idEmpleado)" -ForegroundColor White
    Write-Host ""

    # PASO 3: Verificar en BD
    Write-Host "3️⃣ Verificar en BD con:" -ForegroundColor Yellow
    Write-Host "   sqlplus datum_user/datum2025@//localhost:1522/XEPDB1 @verificar-sincronizacion.sql" -ForegroundColor Gray

} catch {
    Write-Host "   ❌ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
