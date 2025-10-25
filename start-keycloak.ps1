# ════════════════════════════════════════════════════════════════════════════
# Script de Arranque - Keycloak + Oracle
# ════════════════════════════════════════════════════════════════════════════

Write-Host "`n╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🚀 INICIANDO INFRAESTRUCTURA DATUM TRAVELS                   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# ═══════════════════════════════════════════════════════════════════════
# 1. Verificar Docker
# ═══════════════════════════════════════════════════════════════════════

Write-Host "🐳 Verificando Docker..." -ForegroundColor Yellow

$dockerRunning = docker info 2>&1 | Out-Null; $?

if (-not $dockerRunning) {
    Write-Host "❌ Docker no está corriendo. Por favor, inicia Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker está corriendo`n" -ForegroundColor Green

# ═══════════════════════════════════════════════════════════════════════
# 2. Levantar Oracle (si no está corriendo)
# ═══════════════════════════════════════════════════════════════════════

Write-Host "🗄️  Verificando Oracle Database..." -ForegroundColor Yellow

$oracleRunning = docker ps --filter "name=datum-oracle-dev" --filter "status=running" --format "{{.Names}}"

if ($oracleRunning) {
    Write-Host "✅ Oracle ya está corriendo`n" -ForegroundColor Green
} else {
    Write-Host "⏳ Iniciando Oracle Database..." -ForegroundColor Yellow
    docker-compose -f docker-compose-dev.yml up -d datum-db
    
    Write-Host "⏳ Esperando a que Oracle esté saludable (puede tardar ~60 segundos)..." -ForegroundColor Yellow
    
    $maxWait = 120
    $waited = 0
    $interval = 5
    
    while ($waited -lt $maxWait) {
        $health = docker inspect --format='{{.State.Health.Status}}' datum-oracle-dev 2>$null
        
        if ($health -eq "healthy") {
            Write-Host "✅ Oracle está saludable`n" -ForegroundColor Green
            break
        }
        
        Start-Sleep -Seconds $interval
        $waited += $interval
        Write-Host "   Esperando... ($waited/$maxWait segundos)" -ForegroundColor Gray
    }
    
    if ($waited -ge $maxWait) {
        Write-Host "⚠️  Oracle tardó más de lo esperado, pero continuamos..." -ForegroundColor Yellow
    }
}

# ═══════════════════════════════════════════════════════════════════════
# 3. Levantar Keycloak
# ═══════════════════════════════════════════════════════════════════════

Write-Host "🔐 Verificando Keycloak..." -ForegroundColor Yellow

$keycloakRunning = docker ps --filter "name=datum-keycloak-dev" --filter "status=running" --format "{{.Names}}"

if ($keycloakRunning) {
    Write-Host "✅ Keycloak ya está corriendo`n" -ForegroundColor Green
} else {
    Write-Host "⏳ Iniciando Keycloak..." -ForegroundColor Yellow
    docker-compose -f docker-compose-dev.yml up -d datum-keycloak
    
    Write-Host "⏳ Esperando a que Keycloak esté listo (puede tardar ~60 segundos)..." -ForegroundColor Yellow
    
    $maxWait = 120
    $waited = 0
    $interval = 5
    
    while ($waited -lt $maxWait) {
        $health = docker inspect --format='{{.State.Health.Status}}' datum-keycloak-dev 2>$null
        
        if ($health -eq "healthy") {
            Write-Host "✅ Keycloak está listo`n" -ForegroundColor Green
            break
        }
        
        Start-Sleep -Seconds $interval
        $waited += $interval
        Write-Host "   Esperando... ($waited/$maxWait segundos)" -ForegroundColor Gray
    }
    
    if ($waited -ge $maxWait) {
        Write-Host "⚠️  Keycloak tardó más de lo esperado, pero continuamos..." -ForegroundColor Yellow
    }
}

# ═══════════════════════════════════════════════════════════════════════
# 4. Mostrar Estado Final
# ═══════════════════════════════════════════════════════════════════════

Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           📊 ESTADO DE LOS SERVICIOS                             ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Verificar Oracle
$oracleHealth = docker inspect --format='{{.State.Health.Status}}' datum-oracle-dev 2>$null
if ($oracleHealth -eq "healthy") {
    Write-Host "✅ Oracle XE 21c" -ForegroundColor Green
    Write-Host "   URL:    jdbc:oracle:thin:@localhost:1522/XEPDB1" -ForegroundColor White
    Write-Host "   Usuario: datum_user" -ForegroundColor White
    Write-Host "   Password: datum2025`n" -ForegroundColor White
} else {
    Write-Host "❌ Oracle NO está saludable" -ForegroundColor Red
    Write-Host "   Ver logs: docker logs datum-oracle-dev`n" -ForegroundColor Yellow
}

# Verificar Keycloak
$keycloakHealth = docker inspect --format='{{.State.Health.Status}}' datum-keycloak-dev 2>$null
if ($keycloakHealth -eq "healthy") {
    Write-Host "✅ Keycloak 23.0.7" -ForegroundColor Green
    Write-Host "   Console: http://localhost:8180" -ForegroundColor White
    Write-Host "   Usuario: admin" -ForegroundColor White
    Write-Host "   Password: admin123`n" -ForegroundColor White
} else {
    Write-Host "❌ Keycloak NO está saludable" -ForegroundColor Red
    Write-Host "   Ver logs: docker logs datum-keycloak-dev`n" -ForegroundColor Yellow
}

# ═══════════════════════════════════════════════════════════════════════
# 5. Próximos Pasos
# ═══════════════════════════════════════════════════════════════════════

Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           📝 PRÓXIMOS PASOS                                       ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "1️⃣  Configurar Keycloak:" -ForegroundColor Yellow
Write-Host "    • Abre http://localhost:8180" -ForegroundColor White
Write-Host "    • Sigue la guía en: BackEnd/keycloak/GUIA_CONFIGURACION.md`n" -ForegroundColor White

Write-Host "2️⃣  Iniciar Backend (Quarkus):" -ForegroundColor Yellow
Write-Host "    cd BackEnd/quarkus-api" -ForegroundColor White
Write-Host "    mvn quarkus:dev`n" -ForegroundColor White

Write-Host "3️⃣  Iniciar Frontend (React):" -ForegroundColor Yellow
Write-Host "    cd FrontEnd/frontend" -ForegroundColor White
Write-Host "    npm run dev`n" -ForegroundColor White

Write-Host "═══════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# ═══════════════════════════════════════════════════════════════════════
# 6. Ver Logs (opcional)
# ═══════════════════════════════════════════════════════════════════════

$verLogs = Read-Host "¿Quieres ver los logs de Keycloak? (s/n)"

if ($verLogs -eq "s" -or $verLogs -eq "S") {
    Write-Host "`n📜 Mostrando logs de Keycloak (Ctrl+C para salir)...`n" -ForegroundColor Yellow
    docker logs -f datum-keycloak-dev
}
