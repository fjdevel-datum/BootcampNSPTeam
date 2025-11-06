# ============================================================================
# SCRIPT: Cambiar IP Local Automáticamente
# ============================================================================
# Descripción: Detecta la nueva IP y actualiza archivos de configuración
# Uso: Ejecutar cuando cambies de WiFi
# ============================================================================

Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   DATUM TRAVELS - ACTUALIZACIÓN DE IP LOCAL            ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# PASO 1: Detectar IP actual
# ============================================================================
Write-Host "🔍 Detectando IP local..." -ForegroundColor Yellow

$ipActual = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"} | Select-Object -First 1).IPAddress

if (-not $ipActual) {
    Write-Host "❌ No se pudo detectar una IP local (192.168.x.x)" -ForegroundColor Red
    Write-Host ""
    Write-Host "IPs disponibles:" -ForegroundColor Yellow
    ipconfig | findstr "IPv4"
    Write-Host ""
    Write-Host "Por favor, ingresa tu IP manualmente:" -ForegroundColor Cyan
    $ipActual = Read-Host "IP"
    
    if (-not $ipActual) {
        Write-Host "❌ IP no válida" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ IP detectada: $ipActual" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PASO 2: Leer IP anterior del archivo .env
# ============================================================================
$envPath = "FrontEnd\frontend\.env"

if (-not (Test-Path $envPath)) {
    Write-Host "⚠️  No se encontró el archivo .env" -ForegroundColor Yellow
    Write-Host "   Creando archivo nuevo..." -ForegroundColor Yellow
    $ipAnterior = "localhost"
} else {
    $envContent = Get-Content $envPath -Raw
    if ($envContent -match 'VITE_KEYCLOAK_HOST=(\d+\.\d+\.\d+\.\d+)') {
        $ipAnterior = $matches[1]
        Write-Host "📋 IP anterior: $ipAnterior" -ForegroundColor Gray
    } else {
        $ipAnterior = "localhost"
        Write-Host "📋 No se encontró IP anterior configurada" -ForegroundColor Gray
    }
}

Write-Host ""

# Verificar si la IP es la misma
if ($ipActual -eq $ipAnterior) {
    Write-Host "ℹ️  La IP no ha cambiado ($ipActual)" -ForegroundColor Cyan
    Write-Host "   No es necesario actualizar la configuración" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Presiona ENTER para salir"
    exit 0
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📝 ACTUALIZACIONES A REALIZAR:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "  IP Anterior: $ipAnterior" -ForegroundColor Red
Write-Host "  IP Nueva:    $ipActual" -ForegroundColor Green
Write-Host ""
Write-Host "  Se actualizarán:" -ForegroundColor White
Write-Host "    ✓ Frontend (.env)" -ForegroundColor Gray
Write-Host "    ✓ Backend (application.properties)" -ForegroundColor Gray
Write-Host "    ! Keycloak (manual - te mostraré cómo)" -ForegroundColor Yellow
Write-Host ""

$respuesta = Read-Host "¿Continuar? (s/n)"

if ($respuesta -ne "s" -and $respuesta -ne "S") {
    Write-Host "Operación cancelada" -ForegroundColor Yellow
    exit 0
}

Write-Host ""

# ============================================================================
# PASO 3: Actualizar Frontend (.env)
# ============================================================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📦 Actualizando Frontend (.env)..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Crear backup
if (Test-Path $envPath) {
    $backupPath = "$envPath.backup"
    Copy-Item $envPath $backupPath -Force
    Write-Host "  💾 Backup creado: $backupPath" -ForegroundColor Gray
}

# Crear nuevo contenido
$nuevoEnvContent = @"
# ============================================================================
# CONFIGURACIÓN RED LOCAL (LAN) - PWA MÓVIL
# ============================================================================
# IP Local de tu PC: $ipActual
# Acceso desde celular: http://$ipActual:5173
# Última actualización: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# ============================================================================

# Keycloak Configuration (Red Local)
VITE_KEYCLOAK_HOST=$ipActual
VITE_KEYCLOAK_URL=http://$ipActual:8180
VITE_KEYCLOAK_REALM=datum-travels
VITE_KEYCLOAK_CLIENT_ID=datum-travels-frontend

# API Backend Configuration
VITE_API_BASE_URL=http://$ipActual:8081/api

# Proxy Configuration (para desarrollo)
VITE_PROXY_BACKEND=http://localhost:8081
VITE_PROXY_OCR=http://localhost:8080
"@

Set-Content -Path $envPath -Value $nuevoEnvContent -Encoding UTF8
Write-Host "  ✅ Frontend actualizado" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PASO 4: Actualizar Backend (application.properties)
# ============================================================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "☕ Actualizando Backend (application.properties)..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$propsPath = "BackEnd\quarkus-api\src\main\resources\application.properties"

if (-not (Test-Path $propsPath)) {
    Write-Host "  ⚠️  No se encontró application.properties" -ForegroundColor Yellow
    Write-Host "  Saltando actualización del backend..." -ForegroundColor Yellow
} else {
    # Crear backup
    $backupPropsPath = "$propsPath.backup"
    Copy-Item $propsPath $backupPropsPath -Force
    Write-Host "  💾 Backup creado: $backupPropsPath" -ForegroundColor Gray
    
    # Leer contenido actual
    $propsContent = Get-Content $propsPath -Raw
    
    # Agregar nueva IP a CORS (manteniendo las anteriores)
    if ($propsContent -match 'quarkus\.http\.cors\.origins=([^\n]+)') {
        $corsActual = $matches[1]
        
        # Verificar si la IP ya existe
        if ($corsActual -notmatch [regex]::Escape("http://$ipActual:5173")) {
            $nuevoCors = "$corsActual,http://$ipActual:5173"
            $propsContent = $propsContent -replace 'quarkus\.http\.cors\.origins=[^\n]+', "quarkus.http.cors.origins=$nuevoCors"
            
            Set-Content -Path $propsPath -Value $propsContent -Encoding UTF8
            Write-Host "  ✅ CORS actualizado (IP agregada)" -ForegroundColor Green
        } else {
            Write-Host "  ℹ️  CORS ya incluye la IP $ipActual" -ForegroundColor Cyan
        }
    } else {
        Write-Host "  ⚠️  No se encontró configuración de CORS" -ForegroundColor Yellow
        Write-Host "  Por favor, agrega manualmente:" -ForegroundColor Yellow
        Write-Host "     quarkus.http.cors.origins=http://localhost:5173,http://$ipActual:5173" -ForegroundColor White
    }
}

Write-Host ""

# ============================================================================
# PASO 5: Instrucciones para Keycloak
# ============================================================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔐 Configurar Keycloak (MANUAL)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Debes actualizar Keycloak manualmente" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 PASOS:" -ForegroundColor White
Write-Host ""
Write-Host "  1. Abre en tu navegador: http://localhost:8180" -ForegroundColor White
Write-Host "  2. Login: admin / admin2025" -ForegroundColor White
Write-Host "  3. Clients → datum-travels-frontend → Settings" -ForegroundColor White
Write-Host "  4. En 'Valid Redirect URIs' AGREGA:" -ForegroundColor White
Write-Host ""
Write-Host "     http://$ipActual`:5173/*" -ForegroundColor Yellow -BackgroundColor DarkBlue
Write-Host ""
Write-Host "  5. En 'Web Origins' AGREGA:" -ForegroundColor White
Write-Host ""
Write-Host "     http://$ipActual`:5173" -ForegroundColor Yellow -BackgroundColor DarkBlue
Write-Host ""
Write-Host "  6. Click en 'Save'" -ForegroundColor White
Write-Host ""
Write-Host "💡 TIP: Puedes dejar las IPs anteriores para usar en múltiples redes" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# PASO 6: Resumen final
# ============================================================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ ACTUALIZACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 ARCHIVOS ACTUALIZADOS:" -ForegroundColor Yellow
Write-Host "  ✅ FrontEnd/frontend/.env" -ForegroundColor Green
Write-Host "  ✅ BackEnd/.../application.properties" -ForegroundColor Green
Write-Host "  ⏳ Keycloak (pendiente - manual)" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔄 SIGUIENTE PASO:" -ForegroundColor Magenta
Write-Host "  1. Configura Keycloak (ver instrucciones arriba)" -ForegroundColor White
Write-Host "  2. Reinicia Backend y Frontend:" -ForegroundColor White
Write-Host ""
Write-Host "     # Terminal Backend:" -ForegroundColor Gray
Write-Host "     cd BackEnd\quarkus-api" -ForegroundColor White
Write-Host "     .\mvnw quarkus:dev" -ForegroundColor White
Write-Host ""
Write-Host "     # Terminal Frontend:" -ForegroundColor Gray
Write-Host "     cd FrontEnd\frontend" -ForegroundColor White
Write-Host "     .\iniciar-lan.ps1" -ForegroundColor White
Write-Host ""
Write-Host "📱 NUEVA URL DESDE CELULAR:" -ForegroundColor Magenta
Write-Host ""
Write-Host "   http://$ipActual`:5173" -ForegroundColor Yellow -BackgroundColor DarkBlue
Write-Host ""

Read-Host "Presiona ENTER para salir"
