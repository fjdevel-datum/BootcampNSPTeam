# ============================================================================
# SCRIPT: Setup Rápido para Presentación
# ============================================================================
# Descripción: Configura todo automáticamente en un nuevo lugar
# Uso: Ejecutar cuando llegues al lugar de presentación
# ============================================================================

Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   DATUM TRAVELS - SETUP PARA PRESENTACIÓN              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# PASO 1: Detectar IP actual
# ============================================================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔍 PASO 1: Detectando red WiFi..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$ipActual = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"} | Select-Object -First 1).IPAddress

if (-not $ipActual) {
    Write-Host "❌ No se detectó una IP local" -ForegroundColor Red
    Write-Host ""
    Write-Host "IPs disponibles:" -ForegroundColor Yellow
    ipconfig | findstr "IPv4"
    Write-Host ""
    Write-Host "Ingresa tu IP manualmente (ej: 192.168.0.105):" -ForegroundColor Cyan
    $ipActual = Read-Host "IP"
}

Write-Host "✅ IP detectada: $ipActual" -ForegroundColor Green
Write-Host ""
Write-Host "📱 URL desde celular: http://$ipActual`:5173" -ForegroundColor Magenta
Write-Host ""

# ============================================================================
# PASO 2: Actualizar archivos de configuración
# ============================================================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📝 PASO 2: Actualizando configuración..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Actualizar Frontend .env
$envPath = "FrontEnd\frontend\.env"
if (Test-Path $envPath) {
    Copy-Item $envPath "$envPath.backup" -Force
}

$envContent = @"
# Configuración para presentación - IP: $ipActual
# Generado: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

VITE_KEYCLOAK_HOST=$ipActual
VITE_KEYCLOAK_URL=http://$ipActual:8180
VITE_KEYCLOAK_REALM=datum-travels
VITE_KEYCLOAK_CLIENT_ID=datum-travels-frontend
VITE_API_BASE_URL=http://$ipActual:8081/api
VITE_PROXY_BACKEND=http://localhost:8081
VITE_PROXY_OCR=http://localhost:8080
"@

Set-Content -Path $envPath -Value $envContent -Encoding UTF8
Write-Host "  ✅ Frontend (.env) actualizado" -ForegroundColor Green

# Actualizar Backend application.properties
$propsPath = "BackEnd\quarkus-api\src\main\resources\application.properties"
if (Test-Path $propsPath) {
    Copy-Item $propsPath "$propsPath.backup" -Force
    
    $propsContent = Get-Content $propsPath -Raw
    
    if ($propsContent -match 'quarkus\.http\.cors\.origins=([^\n]+)') {
        $corsActual = $matches[1]
        
        if ($corsActual -notmatch [regex]::Escape("http://$ipActual:5173")) {
            $nuevoCors = "$corsActual,http://$ipActual:5173"
            $propsContent = $propsContent -replace 'quarkus\.http\.cors\.origins=[^\n]+', "quarkus.http.cors.origins=$nuevoCors"
            Set-Content -Path $propsPath -Value $propsContent -Encoding UTF8
            Write-Host "  ✅ Backend (CORS) actualizado" -ForegroundColor Green
        } else {
            Write-Host "  ℹ️  Backend ya tiene la IP configurada" -ForegroundColor Cyan
        }
    }
}

Write-Host ""

# ============================================================================
# PASO 3: Configurar Firewall
# ============================================================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔥 PASO 3: Configurando Firewall..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Verificar si es admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if ($isAdmin) {
    Write-Host "  ✅ Ejecutando como Administrador" -ForegroundColor Green
    Write-Host ""
    
    # Eliminar reglas antiguas si existen
    Get-NetFirewallRule -DisplayName "Datum Travels*" -ErrorAction SilentlyContinue | Remove-NetFirewallRule -ErrorAction SilentlyContinue
    
    # Crear nuevas reglas
    New-NetFirewallRule -DisplayName "Datum Travels - Vite" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow -Profile Private,Domain -ErrorAction SilentlyContinue | Out-Null
    New-NetFirewallRule -DisplayName "Datum Travels - Backend" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow -Profile Private,Domain -ErrorAction SilentlyContinue | Out-Null
    New-NetFirewallRule -DisplayName "Datum Travels - Keycloak" -Direction Inbound -LocalPort 8180 -Protocol TCP -Action Allow -Profile Private,Domain -ErrorAction SilentlyContinue | Out-Null
    New-NetFirewallRule -DisplayName "Datum Travels - OCR" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow -Profile Private,Domain -ErrorAction SilentlyContinue | Out-Null
    
    Write-Host "  ✅ Firewall configurado correctamente" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  NO estás ejecutando como Administrador" -ForegroundColor Yellow
    Write-Host "  📋 Copia estos comandos y ejecútalos en PowerShell ADMIN:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "     New-NetFirewallRule -DisplayName `"Datum Travels - Vite`" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow -Profile Private,Domain" -ForegroundColor White
    Write-Host "     New-NetFirewallRule -DisplayName `"Datum Travels - Backend`" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow -Profile Private,Domain" -ForegroundColor White
    Write-Host "     New-NetFirewallRule -DisplayName `"Datum Travels - Keycloak`" -Direction Inbound -LocalPort 8180 -Protocol TCP -Action Allow -Profile Private,Domain" -ForegroundColor White
    Write-Host "     New-NetFirewallRule -DisplayName `"Datum Travels - OCR`" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow -Profile Private,Domain" -ForegroundColor White
    Write-Host ""
}

Write-Host ""

# ============================================================================
# PASO 4: Verificar Docker
# ============================================================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🐳 PASO 4: Verificando Docker..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Docker no está corriendo" -ForegroundColor Red
    Write-Host "  📌 Inicia Docker Desktop y vuelve a ejecutar este script" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Presiona ENTER para salir"
    exit 1
}

Write-Host "  ✅ Docker está corriendo" -ForegroundColor Green
Write-Host ""

# Verificar contenedores
$keycloak = docker ps --filter "name=datum-keycloak-dev" --format "{{.Names}}"
$oracle = docker ps --filter "name=datum-oracle-dev" --format "{{.Names}}"

if (-not $keycloak -or -not $oracle) {
    Write-Host "  ⚠️  Servicios no están corriendo. Iniciando..." -ForegroundColor Yellow
    docker-compose -f docker-compose-dev.yml up -d
    Write-Host "  ⏳ Esperando 30 segundos a que inicien..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    Write-Host "  ✅ Servicios iniciados" -ForegroundColor Green
} else {
    Write-Host "  ✅ Servicios ya están corriendo" -ForegroundColor Green
}

Write-Host ""

# ============================================================================
# PASO 5: Instrucciones para Keycloak
# ============================================================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔐 PASO 5: Configurar Keycloak (MANUAL)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Debes configurar Keycloak ahora" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 PASOS:" -ForegroundColor White
Write-Host ""
Write-Host "  1. Abre: http://localhost:8180" -ForegroundColor White
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

$abrirKeycloak = Read-Host "¿Abrir Keycloak ahora en el navegador? (s/n)"
if ($abrirKeycloak -eq "s" -or $abrirKeycloak -eq "S") {
    Start-Process "http://localhost:8180"
    Write-Host ""
    Write-Host "  🌐 Navegador abierto con Keycloak" -ForegroundColor Green
}

Write-Host ""
Read-Host "⏸️  Presiona ENTER cuando hayas configurado Keycloak"

# ============================================================================
# RESUMEN FINAL
# ============================================================================
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 RESUMEN:" -ForegroundColor Yellow
Write-Host "  ✅ IP detectada: $ipActual" -ForegroundColor Green
Write-Host "  ✅ Archivos actualizados" -ForegroundColor Green
Write-Host "  ✅ Firewall configurado" -ForegroundColor Green
Write-Host "  ✅ Docker corriendo" -ForegroundColor Green
Write-Host "  ✅ Keycloak configurado" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 PRÓXIMOS PASOS:" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Terminal 1 (Backend):" -ForegroundColor Cyan
Write-Host "    cd BackEnd\quarkus-api" -ForegroundColor White
Write-Host "    .\mvnw quarkus:dev" -ForegroundColor White
Write-Host ""
Write-Host "  Terminal 2 (Frontend):" -ForegroundColor Cyan
Write-Host "    cd FrontEnd\frontend" -ForegroundColor White
Write-Host "    npm run dev -- --host 0.0.0.0" -ForegroundColor White
Write-Host ""
Write-Host "📱 ACCESO DESDE CELULAR:" -ForegroundColor Magenta
Write-Host ""
Write-Host "   http://$ipActual`:5173" -ForegroundColor Yellow -BackgroundColor DarkBlue
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$iniciarServicios = Read-Host "¿Quieres iniciar Backend y Frontend ahora? (s/n)"

if ($iniciarServicios -eq "s" -or $iniciarServicios -eq "S") {
    Write-Host ""
    Write-Host "🚀 Iniciando Backend en nueva ventana..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'BackEnd\quarkus-api'; Write-Host 'Iniciando Backend...' -ForegroundColor Green; .\mvnw quarkus:dev"
    
    Start-Sleep -Seconds 2
    
    Write-Host "🚀 Iniciando Frontend en nueva ventana..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'FrontEnd\frontend'; Write-Host 'Iniciando Frontend...' -ForegroundColor Green; npm run dev -- --host 0.0.0.0"
    
    Write-Host ""
    Write-Host "✅ Servicios iniciando en nuevas ventanas" -ForegroundColor Green
    Write-Host "⏳ Espera 1-2 minutos a que carguen" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📱 Luego abre en tu celular: http://$ipActual`:5173" -ForegroundColor Magenta
}

Write-Host ""
Read-Host "Presiona ENTER para salir"
