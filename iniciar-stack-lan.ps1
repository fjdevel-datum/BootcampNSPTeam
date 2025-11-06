# ============================================================================
# SCRIPT MAESTRO: Levantar Stack Completo en Red Local (LAN)
# ============================================================================
# Descripción: Inicia todos los servicios para acceso desde móvil
# ============================================================================

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   DATUM TRAVELS - INICIO COMPLETO EN RED LOCAL (LAN)        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Obtener IP local
$ipLocal = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"} | Select-Object -First 1).IPAddress

if (-not $ipLocal) {
    Write-Host "❌ ERROR: No se pudo detectar la IP local 192.168.x.x" -ForegroundColor Red
    Write-Host "   Verifica tu conexión WiFi" -ForegroundColor Yellow
    exit 1
}

Write-Host "🌐 IP Local detectada: $ipLocal" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PASO 1: Verificar servicios Docker
# ============================================================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📦 PASO 1: Verificando servicios Docker..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Verificar si Docker está corriendo
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker no está corriendo. Por favor inicia Docker Desktop" -ForegroundColor Red
    exit 1
}

# Verificar contenedores
$keycloakRunning = docker ps --filter "name=datum-keycloak-dev" --format "{{.Names}}"
$oracleRunning = docker ps --filter "name=datum-oracle-dev" --format "{{.Names}}"

if (-not $keycloakRunning -or -not $oracleRunning) {
    Write-Host "⚠️  Servicios Docker no están corriendo" -ForegroundColor Yellow
    Write-Host "   Iniciando servicios..." -ForegroundColor Yellow
    docker-compose -f docker-compose-dev.yml up -d
    
    Write-Host ""
    Write-Host "⏳ Esperando 30 segundos a que inicien los servicios..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
} else {
    Write-Host "✅ Servicios Docker ya están corriendo" -ForegroundColor Green
}

Write-Host ""

# ============================================================================
# PASO 2: Instrucciones para Backend
# ============================================================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "☕ PASO 2: Backend Quarkus" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Abre una NUEVA terminal PowerShell y ejecuta:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   cd 'BackEnd\quarkus-api'" -ForegroundColor White
Write-Host "   .\mvnw quarkus:dev" -ForegroundColor White
Write-Host ""
Write-Host "⏸️  Presiona ENTER cuando el Backend esté corriendo..." -ForegroundColor Magenta
$null = Read-Host

# ============================================================================
# PASO 3: Microservicio OCR (Opcional)
# ============================================================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔍 PASO 3: Microservicio OCR (Opcional)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "❓ ¿Quieres iniciar el servicio OCR? (s/n)" -ForegroundColor Yellow
$startOcr = Read-Host

if ($startOcr -eq "s" -or $startOcr -eq "S") {
    Write-Host ""
    Write-Host "📍 Abre OTRA terminal PowerShell y ejecuta:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   cd 'ocr-quarkus'" -ForegroundColor White
    Write-Host "   .\mvnw quarkus:dev" -ForegroundColor White
    Write-Host ""
    Write-Host "⏸️  Presiona ENTER cuando el OCR esté corriendo..." -ForegroundColor Magenta
    $null = Read-Host
}

# ============================================================================
# PASO 4: Configurar Keycloak
# ============================================================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔐 PASO 4: Configuración de Keycloak" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Debes configurar Keycloak manualmente" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Abre en tu navegador: http://localhost:8180" -ForegroundColor White
Write-Host "2️⃣  Login: admin / admin2025" -ForegroundColor White
Write-Host "3️⃣  Ve a: Clients → datum-travels-frontend → Settings" -ForegroundColor White
Write-Host "4️⃣  En 'Valid Redirect URIs' AGREGA:" -ForegroundColor White
Write-Host "    http://$ipLocal`:5173/*" -ForegroundColor Cyan
Write-Host "5️⃣  En 'Web Origins' AGREGA:" -ForegroundColor White
Write-Host "    http://$ipLocal`:5173" -ForegroundColor Cyan
Write-Host "6️⃣  Click en 'Save'" -ForegroundColor White
Write-Host ""
Write-Host "⏸️  Presiona ENTER cuando hayas configurado Keycloak..." -ForegroundColor Magenta
$null = Read-Host

# ============================================================================
# PASO 5: Iniciar Frontend
# ============================================================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎨 PASO 5: Iniciando Frontend..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Set-Location "FrontEnd\frontend"

Write-Host "📱 ACCESO DESDE MÓVIL:" -ForegroundColor Magenta
Write-Host ""
Write-Host "   1️⃣  Conecta tu celular a la misma WiFi" -ForegroundColor White
Write-Host "   2️⃣  Abre el navegador en:" -ForegroundColor White
Write-Host ""
Write-Host "       http://$ipLocal`:5173" -ForegroundColor Yellow -BackgroundColor DarkBlue
Write-Host ""
Write-Host "   3️⃣  Instala la PWA (Agregar a pantalla de inicio)" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Iniciando Frontend..." -ForegroundColor Green
Write-Host ""

# Iniciar Vite con host 0.0.0.0
npm run dev -- --host 0.0.0.0
