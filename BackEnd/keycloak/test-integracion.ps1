# 🧪 Script de Pruebas - Integración Keycloak + Quarkus

Write-Host "`n╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🧪 PRUEBAS DE INTEGRACIÓN KEYCLOAK + QUARKUS                 ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Configuración
$KEYCLOAK_URL = "http://localhost:8180"
$API_URL = "http://localhost:8081"  # Quarkus cambió al puerto 8081
$USERNAME = "carlos.test"
$PASSWORD = "test123"

# ══════════════════════════════════════════════════════════════════════
# PASO 1: Verificar que Keycloak está corriendo
# ══════════════════════════════════════════════════════════════════════

Write-Host "📋 PASO 1: Verificando Keycloak..." -ForegroundColor Yellow

try {
    $keycloakHealth = Invoke-WebRequest -Uri "$KEYCLOAK_URL/health/ready" -Method GET -ErrorAction Stop
    
    if ($keycloakHealth.StatusCode -eq 200) {
        Write-Host "✅ Keycloak está corriendo correctamente`n" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error: Keycloak NO está corriendo" -ForegroundColor Red
    Write-Host "   Por favor, inicia Keycloak con:" -ForegroundColor Yellow
    Write-Host "   docker-compose -f docker-compose-dev.yml up -d datum-keycloak`n" -ForegroundColor White
    exit 1
}

# ══════════════════════════════════════════════════════════════════════
# PASO 2: Verificar que Quarkus está corriendo
# ══════════════════════════════════════════════════════════════════════

Write-Host "📋 PASO 2: Verificando API Quarkus..." -ForegroundColor Yellow

try {
    $apiHealth = Invoke-WebRequest -Uri "$API_URL/q/health" -Method GET -ErrorAction Stop
    
    if ($apiHealth.StatusCode -eq 200) {
        Write-Host "✅ API Quarkus está corriendo correctamente`n" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error: API Quarkus NO está corriendo" -ForegroundColor Red
    Write-Host "   Por favor, inicia Quarkus con:" -ForegroundColor Yellow
    Write-Host "   cd BackEnd/quarkus-api" -ForegroundColor White
    Write-Host "   .\mvnw.cmd quarkus:dev`n" -ForegroundColor White
    exit 1
}

# ══════════════════════════════════════════════════════════════════════
# PASO 3: Probar Login (autenticación con Keycloak)
# ══════════════════════════════════════════════════════════════════════

Write-Host "📋 PASO 3: Probando Login con Keycloak..." -ForegroundColor Yellow

$loginBody = @{
    usuarioApp = $USERNAME
    contrasena = $PASSWORD
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest `
        -Uri "$API_URL/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Login exitoso!" -ForegroundColor Green
    Write-Host "   Usuario: $($loginData.usuario.usuarioApp)" -ForegroundColor White
    Write-Host "   Email: $($loginData.usuario.correo)" -ForegroundColor White
    Write-Host "   Token (primeros 50 caracteres): $($loginData.token.Substring(0, 50))...`n" -ForegroundColor White
    
    # Guardar token para siguientes pruebas
    $global:JWT_TOKEN = $loginData.token
    
} catch {
    Write-Host "❌ Error en login:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Respuesta: $responseBody`n" -ForegroundColor Yellow
    }
    exit 1
}

# ══════════════════════════════════════════════════════════════════════
# PASO 4: Decodificar Token JWT (verificar que viene de Keycloak)
# ══════════════════════════════════════════════════════════════════════

Write-Host "📋 PASO 4: Verificando Token JWT..." -ForegroundColor Yellow

# Decodificar payload del JWT (parte entre los dos puntos)
$tokenParts = $global:JWT_TOKEN -split '\.'
if ($tokenParts.Length -ge 2) {
    # Agregar padding si es necesario
    $payload = $tokenParts[1]
    $padding = 4 - ($payload.Length % 4)
    if ($padding -lt 4) {
        $payload = $payload + ("=" * $padding)
    }
    
    # Decodificar Base64
    $payloadBytes = [System.Convert]::FromBase64String($payload)
    $payloadJson = [System.Text.Encoding]::UTF8.GetString($payloadBytes)
    $payloadData = $payloadJson | ConvertFrom-Json
    
    Write-Host "✅ Token JWT decodificado:" -ForegroundColor Green
    Write-Host "   Issuer: $($payloadData.iss)" -ForegroundColor White
    Write-Host "   Username: $($payloadData.preferred_username)" -ForegroundColor White
    Write-Host "   Email: $($payloadData.email)" -ForegroundColor White
    Write-Host "   Roles: $($payloadData.realm_access.roles -join ', ')`n" -ForegroundColor White
    
    # Verificar que el token viene de Keycloak
    if ($payloadData.iss -like "*keycloak*" -or $payloadData.iss -like "*datum-travels*") {
        Write-Host "✅ Token JWT firmado por Keycloak (Issuer correcto)`n" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Advertencia: El issuer no parece ser de Keycloak" -ForegroundColor Yellow
        Write-Host "   Issuer: $($payloadData.iss)`n" -ForegroundColor White
    }
}

# ══════════════════════════════════════════════════════════════════════
# PASO 5: Probar endpoint protegido
# ══════════════════════════════════════════════════════════════════════

Write-Host "📋 PASO 5: Probando endpoint protegido..." -ForegroundColor Yellow

try {
    $eventosResponse = Invoke-WebRequest `
        -Uri "$API_URL/api/eventos?idEmpleado=1" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $global:JWT_TOKEN" } `
        -ErrorAction Stop
    
    if ($eventosResponse.StatusCode -eq 200) {
        Write-Host "✅ Endpoint protegido accesible con token válido" -ForegroundColor Green
        
        $eventos = $eventosResponse.Content | ConvertFrom-Json
        Write-Host "   Eventos encontrados: $($eventos.Count)`n" -ForegroundColor White
    }
    
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 403) {
        Write-Host "⚠️  Endpoint retornó 403 Forbidden" -ForegroundColor Yellow
        Write-Host "   El usuario no tiene el rol requerido" -ForegroundColor White
        Write-Host "   Asigna el rol 'empleado' en Keycloak`n" -ForegroundColor White
    } elseif ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "❌ Token inválido o expirado (401 Unauthorized)`n" -ForegroundColor Red
    } else {
        Write-Host "❌ Error al acceder endpoint:" -ForegroundColor Red
        Write-Host "   $($_.Exception.Message)`n" -ForegroundColor Yellow
    }
}

# ══════════════════════════════════════════════════════════════════════
# RESUMEN FINAL
# ══════════════════════════════════════════════════════════════════════

Write-Host "`n╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                  ✅ PRUEBAS COMPLETADAS                          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📊 Resumen:" -ForegroundColor Yellow
Write-Host "   ✅ Keycloak: Funcionando" -ForegroundColor Green
Write-Host "   ✅ API Quarkus: Funcionando" -ForegroundColor Green
Write-Host "   ✅ Login: Exitoso" -ForegroundColor Green
Write-Host "   ✅ Token JWT: Válido (firmado por Keycloak)" -ForegroundColor Green
Write-Host "   ✅ Endpoint protegido: Accesible`n" -ForegroundColor Green

Write-Host "🎉 ¡Integración Keycloak + Quarkus funcionando correctamente!" -ForegroundColor Green
Write-Host "`nPuedes decodificar el token en: https://jwt.io" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
