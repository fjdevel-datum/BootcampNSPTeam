# =====================================================
# Script: Sincronizar Keycloak ID con Base de Datos
# =====================================================
# Propósito: Obtener keycloak_id desde Keycloak API
#            y actualizar la tabla Usuario en Oracle
# =====================================================

Write-Host "🔄 Iniciando sincronización Keycloak → Oracle..." -ForegroundColor Cyan
Write-Host ""

# =====================================================
# PASO 1: Obtener token de admin de Keycloak
# =====================================================

Write-Host "📡 Obteniendo token de autenticación..." -ForegroundColor Yellow

$tokenUrl = "http://localhost:8080/realms/master/protocol/openid-connect/token"
$tokenBody = @{
    grant_type = "password"
    client_id = "admin-cli"
    username = "admin"
    password = "admin123"
}

try {
    $tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $tokenBody -ContentType "application/x-www-form-urlencoded"
    $accessToken = $tokenResponse.access_token
    Write-Host "✅ Token obtenido exitosamente" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error al obtener token: $_" -ForegroundColor Red
    exit 1
}

# =====================================================
# PASO 2: Obtener usuarios de Keycloak
# =====================================================

Write-Host "👥 Obteniendo usuarios de Keycloak..." -ForegroundColor Yellow

$usersUrl = "http://localhost:8080/admin/realms/datum-travels/users"
$headers = @{
    Authorization = "Bearer $accessToken"
}

try {
    $users = Invoke-RestMethod -Uri $usersUrl -Method Get -Headers $headers
    Write-Host "✅ Se encontraron $($users.Count) usuarios en Keycloak" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error al obtener usuarios: $_" -ForegroundColor Red
    exit 1
}

# =====================================================
# PASO 3: Mostrar usuarios y sus IDs
# =====================================================

Write-Host "📋 Usuarios encontrados:" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Gray

$userMap = @{}

foreach ($user in $users) {
    $username = $user.username
    $keycloakId = $user.id
    $email = $user.email
    
    Write-Host "Usuario: $username" -ForegroundColor White
    Write-Host "  └─ Keycloak ID: $keycloakId" -ForegroundColor Gray
    Write-Host "  └─ Email: $email" -ForegroundColor Gray
    Write-Host ""
    
    $userMap[$username] = $keycloakId
}

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

# =====================================================
# PASO 4: Generar SQL para actualizar Oracle
# =====================================================

Write-Host "📝 Generando script SQL..." -ForegroundColor Yellow

$sqlFile = ".\BackEnd\scripts\sync-keycloak-ids.sql"
$sqlContent = @"
-- =============================================
-- Script AUTO-GENERADO: Sincronización Keycloak
-- Generado: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- =============================================

"@

foreach ($username in $userMap.Keys) {
    $keycloakId = $userMap[$username]
    $sqlContent += @"
UPDATE Usuario
SET keycloak_id = '$keycloakId'
WHERE usuario_app = '$username';

"@
}

$sqlContent += @"

COMMIT;

-- Verificar actualización
SELECT 
    usuario_app,
    keycloak_id,
    CASE 
        WHEN keycloak_id IS NOT NULL THEN 'VINCULADO'
        ELSE 'PENDIENTE'
    END as estado
FROM Usuario
ORDER BY id_usuario;

EXIT;
"@

$sqlContent | Out-File -FilePath $sqlFile -Encoding UTF8

Write-Host "✅ Script SQL generado en: $sqlFile" -ForegroundColor Green
Write-Host ""

# =====================================================
# PASO 5: Ejecutar SQL en Oracle
# =====================================================

Write-Host "🔧 ¿Deseas ejecutar el script en Oracle ahora? (S/N): " -ForegroundColor Yellow -NoNewline
$respuesta = Read-Host

if ($respuesta -eq 'S' -or $respuesta -eq 's') {
    Write-Host ""
    Write-Host "⚙️ Ejecutando script en Oracle..." -ForegroundColor Cyan
    
    # Nota: Ajusta las credenciales según tu configuración
    $env:ORACLE_SID = "XE"
    $oracleCmd = "sqlplus datum_user/datum2025@localhost:1521/XE @$sqlFile"
    
    try {
        Invoke-Expression $oracleCmd
        Write-Host ""
        Write-Host "✅ Script ejecutado exitosamente" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error al ejecutar script: $_" -ForegroundColor Red
        Write-Host "📌 Puedes ejecutarlo manualmente: sqlplus datum_user/datum2025@localhost:1521/XE @$sqlFile" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "📌 Script generado. Ejecútalo manualmente con:" -ForegroundColor Yellow
    Write-Host "   sqlplus datum_user/datum2025@localhost:1521/XE @$sqlFile" -ForegroundColor White
}

Write-Host ""
Write-Host "✅ Sincronización completada" -ForegroundColor Green
Write-Host ""
