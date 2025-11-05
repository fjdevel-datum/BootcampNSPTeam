# Script de prueba para cambiar contraseña
# ====================================

Write-Host "`n=== PRUEBA DE CAMBIO DE CONTRASENA ===" -ForegroundColor Cyan

# 1. Obtener token de acceso
Write-Host "`n[1] Obteniendo token de acceso..." -ForegroundColor Yellow

$loginBody = @{
    username = "usuario1"
    password = "usuario1"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod `
        -Uri "http://localhost:8081/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody

    $token = $loginResponse.accessToken
    Write-Host "✓ Token obtenido exitosamente" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al obtener token: $_" -ForegroundColor Red
    exit 1
}

# 2. Cambiar contraseña
Write-Host "`n[2] Cambiando contraseña..." -ForegroundColor Yellow

$cambiarContrasenaBody = @{
    contrasenaActual = "usuario1"
    contrasenaNueva = "NuevaPass123"
    confirmacionContrasena = "NuevaPass123"
} | ConvertTo-Json

try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    Invoke-RestMethod `
        -Uri "http://localhost:8081/api/empleados/perfil/cambiar-contrasena" `
        -Method PUT `
        -Headers $headers `
        -Body $cambiarContrasenaBody
    
    Write-Host "✓ Contraseña cambiada exitosamente (Respuesta 204 No Content)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al cambiar contraseña: $_" -ForegroundColor Red
    Write-Host "Detalles: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    exit 1
}

# 3. Verificar login con contraseña antigua (debe fallar)
Write-Host "`n[3] Verificando que contraseña antigua NO funciona..." -ForegroundColor Yellow

$loginBodyOld = @{
    username = "usuario1"
    password = "usuario1"
} | ConvertTo-Json

try {
    Invoke-RestMethod `
        -Uri "http://localhost:8081/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBodyOld
    
    Write-Host "✗ ERROR: La contraseña antigua aún funciona" -ForegroundColor Red
    exit 1
} catch {
    Write-Host "✓ Contraseña antigua rechazada correctamente" -ForegroundColor Green
}

# 4. Verificar login con nueva contraseña (debe funcionar)
Write-Host "`n[4] Verificando login con nueva contraseña..." -ForegroundColor Yellow

$loginBodyNew = @{
    username = "usuario1"
    password = "NuevaPass123"
} | ConvertTo-Json

try {
    $newLoginResponse = Invoke-RestMethod `
        -Uri "http://localhost:8081/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBodyNew
    
    Write-Host "✓ Login exitoso con nueva contraseña" -ForegroundColor Green
    Write-Host "  Token obtenido: $($newLoginResponse.accessToken.Substring(0, 50))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Error al hacer login con nueva contraseña: $_" -ForegroundColor Red
    exit 1
}

# 5. Restaurar contraseña original para futuras pruebas
Write-Host "`n[5] Restaurando contraseña original..." -ForegroundColor Yellow

$restaurarBody = @{
    contrasenaActual = "NuevaPass123"
    contrasenaNueva = "usuario1"
    confirmacionContrasena = "usuario1"
} | ConvertTo-Json

try {
    $headers = @{
        "Authorization" = "Bearer $($newLoginResponse.accessToken)"
        "Content-Type" = "application/json"
    }
    
    Invoke-RestMethod `
        -Uri "http://localhost:8081/api/empleados/perfil/cambiar-contrasena" `
        -Method PUT `
        -Headers $headers `
        -Body $restaurarBody
    
    Write-Host "✓ Contraseña restaurada a valor original" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al restaurar contraseña: $_" -ForegroundColor Red
    Write-Host "NOTA: La contraseña de usuario1 es ahora 'NuevaPass123'" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n=== PRUEBA COMPLETADA EXITOSAMENTE ===" -ForegroundColor Green
Write-Host "`nResumen:" -ForegroundColor Cyan
Write-Host "  ✓ Cambio de contraseña funcional" -ForegroundColor Green
Write-Host "  ✓ Contraseña antigua invalidada en Keycloak" -ForegroundColor Green
Write-Host "  ✓ Nueva contraseña funciona para login" -ForegroundColor Green
Write-Host "  ✓ Contraseña restaurada a valor original`n" -ForegroundColor Green
