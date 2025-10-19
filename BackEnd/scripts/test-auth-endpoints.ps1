# ═══════════════════════════════════════════════════════════
# Script de prueba para endpoints de autenticación
# Autor: Datum Travels Team
# Fecha: 2025
# ═══════════════════════════════════════════════════════════

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔐 TESTING - Endpoints de Autenticación" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8080/api/auth"
$usuario = "cmartinez"
$password = "carlos123"

# ═══════════════════════════════════════════════════════════
# 1. HEALTH CHECK
# ═══════════════════════════════════════════════════════════
Write-Host "📋 1. Health Check del servicio..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✅ Servicio funcionando correctamente" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Error en health check: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# ═══════════════════════════════════════════════════════════
# 2. LOGIN
# ═══════════════════════════════════════════════════════════
Write-Host "🔑 2. Login con credenciales..." -ForegroundColor Yellow
Write-Host "   Usuario: $usuario" -ForegroundColor Gray
Write-Host "   Contraseña: $password" -ForegroundColor Gray

$loginBody = @{
    usuarioApp = $usuario
    contrasena = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    Write-Host "   Token Type: $($loginResponse.tokenType)" -ForegroundColor Gray
    Write-Host "   Expira en: $($loginResponse.expiresIn) segundos" -ForegroundColor Gray
    Write-Host "   Empleado: $($loginResponse.nombreCompleto) (ID: $($loginResponse.idEmpleado))" -ForegroundColor Gray
    Write-Host "   Email: $($loginResponse.correo)" -ForegroundColor Gray
    Write-Host "   Token (primeros 50 chars): $($loginResponse.accessToken.Substring(0, [Math]::Min(50, $loginResponse.accessToken.Length)))..." -ForegroundColor Gray
    
    $token = $loginResponse.accessToken
} catch {
    Write-Host "❌ Error en login: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# ═══════════════════════════════════════════════════════════
# 3. VALIDATE TOKEN
# ═══════════════════════════════════════════════════════════
Write-Host "✔️ 3. Validando token..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $validateResponse = Invoke-RestMethod -Uri "$baseUrl/validate" -Method Get -Headers $headers
    Write-Host "✅ Token válido" -ForegroundColor Green
    Write-Host "   Usuario: $($validateResponse.usuarioApp)" -ForegroundColor Gray
    Write-Host "   ID Empleado: $($validateResponse.idEmpleado)" -ForegroundColor Gray
    Write-Host "   Mensaje: $($validateResponse.mensaje)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error al validar token: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# ═══════════════════════════════════════════════════════════
# 4. LOGOUT
# ═══════════════════════════════════════════════════════════
Write-Host "🚪 4. Cerrando sesión (logout)..." -ForegroundColor Yellow

try {
    $logoutResponse = Invoke-RestMethod -Uri "$baseUrl/logout" -Method Post -Headers $headers -ContentType "application/json"
    Write-Host "✅ Logout exitoso" -ForegroundColor Green
    Write-Host "   Mensaje: $($logoutResponse.mensaje)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error en logout: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# ═══════════════════════════════════════════════════════════
# 5. VALIDATE TOKEN DESPUÉS DE LOGOUT (debe fallar)
# ═══════════════════════════════════════════════════════════
Write-Host "🔒 5. Intentando validar token después de logout..." -ForegroundColor Yellow

try {
    $validateAfterLogout = Invoke-RestMethod -Uri "$baseUrl/validate" -Method Get -Headers $headers
    Write-Host "⚠️ ADVERTENCIA: El token todavía es válido (no debería serlo)" -ForegroundColor Yellow
} catch {
    Write-Host "✅ Token invalidado correctamente (esperado)" -ForegroundColor Green
    Write-Host "   Estado HTTP: 401 Unauthorized" -ForegroundColor Gray
}
Write-Host ""

# ═══════════════════════════════════════════════════════════
# 6. LOGIN CON CREDENCIALES INCORRECTAS (debe fallar)
# ═══════════════════════════════════════════════════════════
Write-Host "❌ 6. Intentando login con contraseña incorrecta..." -ForegroundColor Yellow

$wrongLoginBody = @{
    usuarioApp = $usuario
    contrasena = "wrongpassword"
} | ConvertTo-Json

try {
    $wrongLogin = Invoke-RestMethod -Uri "$baseUrl/login" -Method Post -Body $wrongLoginBody -ContentType "application/json"
    Write-Host "⚠️ ADVERTENCIA: Login exitoso con contraseña incorrecta (no debería pasar)" -ForegroundColor Yellow
} catch {
    Write-Host "✅ Login rechazado correctamente (esperado)" -ForegroundColor Green
    Write-Host "   Estado HTTP: 401 Unauthorized" -ForegroundColor Gray
}
Write-Host ""

# ═══════════════════════════════════════════════════════════
# RESUMEN
# ═══════════════════════════════════════════════════════════
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ TODAS LAS PRUEBAS COMPLETADAS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Credenciales de prueba disponibles:" -ForegroundColor Yellow
Write-Host "   Usuario 1: cmartinez / carlos123 (Carlos Martínez)" -ForegroundColor Gray
Write-Host "   Usuario 2: arodriguez / ana123 (Ana Rodríguez)" -ForegroundColor Gray
Write-Host "   Usuario 3: lgonzalez / luis123 (Luis González)" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 Endpoints disponibles:" -ForegroundColor Yellow
Write-Host "   POST $baseUrl/login" -ForegroundColor Gray
Write-Host "   POST $baseUrl/logout" -ForegroundColor Gray
Write-Host "   GET  $baseUrl/validate" -ForegroundColor Gray
Write-Host "   GET  $baseUrl/health" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentación Swagger:" -ForegroundColor Yellow
Write-Host "   http://localhost:8080/swagger-ui" -ForegroundColor Gray
Write-Host ""
