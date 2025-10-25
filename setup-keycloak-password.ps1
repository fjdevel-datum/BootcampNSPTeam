# ═══════════════════════════════════════════════════════════════════════
# Script: Configurar Contraseña de Usuario en Keycloak
# ═══════════════════════════════════════════════════════════════════════
# Descripción:
#   Configura automáticamente la contraseña del usuario carlos.test
#   después de que Keycloak importe el realm.
#
# Uso:
#   .\setup-keycloak-password.ps1
#
# Prerequisitos:
#   - Docker debe estar corriendo
#   - Keycloak debe estar levantado (docker-compose up -d)
# ═══════════════════════════════════════════════════════════════════════

Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🔐 Configurando Contraseña de Usuario en Keycloak    ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Configuración
$KEYCLOAK_URL = "http://localhost:8180"
$ADMIN_USER = "admin"
$ADMIN_PASSWORD = "admin123"
$REALM = "datum-travels"
$USERNAME = "carlos.test"
$NEW_PASSWORD = "test123"

# ═══════════════════════════════════════════════════════════════════════
# Paso 1: Verificar que Keycloak esté corriendo
# ═══════════════════════════════════════════════════════════════════════

Write-Host "1️⃣  Verificando que Keycloak esté corriendo..." -ForegroundColor Yellow

try {
    $healthCheck = Invoke-WebRequest -Uri "$KEYCLOAK_URL/health/ready" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ Keycloak está corriendo y listo`n" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Error: Keycloak no está respondiendo" -ForegroundColor Red
    Write-Host "   Asegúrate de ejecutar primero:" -ForegroundColor Yellow
    Write-Host "   docker-compose -f docker-compose-dev.yml up -d`n" -ForegroundColor Gray
    exit 1
}

# ═══════════════════════════════════════════════════════════════════════
# Paso 2: Esperar a que Keycloak termine de importar el realm
# ═══════════════════════════════════════════════════════════════════════

Write-Host "2️⃣  Esperando a que Keycloak importe el realm (~10 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Write-Host "   ✅ Tiempo de espera completado`n" -ForegroundColor Green

# ═══════════════════════════════════════════════════════════════════════
# Paso 3: Obtener token de administrador
# ═══════════════════════════════════════════════════════════════════════

Write-Host "3️⃣  Obteniendo token de administrador..." -ForegroundColor Yellow

try {
    $tokenResponse = Invoke-RestMethod -Uri "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" `
        -Method POST `
        -Body "grant_type=password&client_id=admin-cli&username=$ADMIN_USER&password=$ADMIN_PASSWORD" `
        -ContentType "application/x-www-form-urlencoded" `
        -ErrorAction Stop
    
    $adminToken = $tokenResponse.access_token
    
    if (-not $adminToken) {
        throw "No se pudo obtener el token de administrador"
    }
    
    Write-Host "   ✅ Token de administrador obtenido`n" -ForegroundColor Green
    
} catch {
    Write-Host "   ❌ Error al autenticar como admin:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)`n" -ForegroundColor Yellow
    exit 1
}

# ═══════════════════════════════════════════════════════════════════════
# Paso 4: Verificar que el realm existe
# ═══════════════════════════════════════════════════════════════════════

Write-Host "4️⃣  Verificando que el realm '$REALM' existe..." -ForegroundColor Yellow

try {
    $realm = Invoke-RestMethod -Uri "$KEYCLOAK_URL/admin/realms/$REALM" `
        -Headers @{Authorization = "Bearer $adminToken"} `
        -ErrorAction Stop
    
    Write-Host "   ✅ Realm '$REALM' encontrado`n" -ForegroundColor Green
    
} catch {
    Write-Host "   ❌ Error: El realm '$REALM' no existe" -ForegroundColor Red
    Write-Host "   Verifica que el archivo realm-export.json se haya importado correctamente`n" -ForegroundColor Yellow
    exit 1
}

# ═══════════════════════════════════════════════════════════════════════
# Paso 5: Buscar el usuario
# ═══════════════════════════════════════════════════════════════════════

Write-Host "5️⃣  Buscando usuario '$USERNAME'..." -ForegroundColor Yellow

try {
    $users = Invoke-RestMethod -Uri "$KEYCLOAK_URL/admin/realms/$REALM/users?username=$USERNAME" `
        -Headers @{Authorization = "Bearer $adminToken"} `
        -ErrorAction Stop
    
    if ($users.Count -eq 0) {
        throw "Usuario '$USERNAME' no encontrado"
    }
    
    $userId = $users[0].id
    $userEmail = $users[0].email
    
    Write-Host "   ✅ Usuario encontrado:" -ForegroundColor Green
    Write-Host "      ID: $userId" -ForegroundColor Gray
    Write-Host "      Email: $userEmail`n" -ForegroundColor Gray
    
} catch {
    Write-Host "   ❌ Error al buscar usuario:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)`n" -ForegroundColor Yellow
    exit 1
}

# ═══════════════════════════════════════════════════════════════════════
# Paso 6: Establecer la contraseña
# ═══════════════════════════════════════════════════════════════════════

Write-Host "6️⃣  Estableciendo contraseña '$NEW_PASSWORD'..." -ForegroundColor Yellow

try {
    $passwordBody = @{
        type = "password"
        value = $NEW_PASSWORD
        temporary = $false
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "$KEYCLOAK_URL/admin/realms/$REALM/users/$userId/reset-password" `
        -Method PUT `
        -Headers @{
            Authorization = "Bearer $adminToken"
            "Content-Type" = "application/json"
        } `
        -Body $passwordBody `
        -ErrorAction Stop
    
    Write-Host "   ✅ Contraseña establecida correctamente`n" -ForegroundColor Green
    
} catch {
    Write-Host "   ❌ Error al establecer contraseña:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)`n" -ForegroundColor Yellow
    exit 1
}

# ═══════════════════════════════════════════════════════════════════════
# Paso 7: Verificar que el login funciona
# ═══════════════════════════════════════════════════════════════════════

Write-Host "7️⃣  Verificando que el login funciona..." -ForegroundColor Yellow

try {
    $testLogin = Invoke-RestMethod -Uri "$KEYCLOAK_URL/realms/$REALM/protocol/openid-connect/token" `
        -Method POST `
        -Body "grant_type=password&client_id=datum-travels-backend&client_secret=tpQkr9c6f1nD8ksGoM51hexkfbnr9UvT&username=$USERNAME&password=$NEW_PASSWORD" `
        -ContentType "application/x-www-form-urlencoded" `
        -ErrorAction Stop
    
    if ($testLogin.access_token) {
        Write-Host "   ✅ Login verificado - Token JWT obtenido exitosamente`n" -ForegroundColor Green
    } else {
        throw "No se recibió token de acceso"
    }
    
} catch {
    Write-Host "   ❌ Error al verificar login:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)`n" -ForegroundColor Yellow
    Write-Host "   ⚠️  La contraseña se configuró pero hay un problema con el client" -ForegroundColor Yellow
}

# ═══════════════════════════════════════════════════════════════════════
# Resumen Final
# ═══════════════════════════════════════════════════════════════════════

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ CONFIGURACIÓN COMPLETADA EXITOSAMENTE             ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📋 Credenciales configuradas:" -ForegroundColor Cyan
Write-Host "   Usuario: $USERNAME" -ForegroundColor White
Write-Host "   Contraseña: $NEW_PASSWORD" -ForegroundColor White
Write-Host "   Realm: $REALM`n" -ForegroundColor White

Write-Host "🧪 Probar el login desde PowerShell:" -ForegroundColor Yellow
Write-Host '$body = @{usuarioApp="carlos.test"; contrasena="test123"} | ConvertTo-Json' -ForegroundColor Gray
Write-Host 'Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method POST -Body $body -ContentType "application/json"' -ForegroundColor Gray

Write-Host "`n🎉 ¡Todo listo para usar!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
