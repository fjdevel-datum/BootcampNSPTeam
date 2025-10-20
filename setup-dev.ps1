# ════════════════════════════════════════════════════════════════════════════
# Script de Setup - Datum Travels DEV
# ════════════════════════════════════════════════════════════════════════════
# Descripción: Levanta Oracle XE y verifica la conexión
# Uso: .\setup-dev.ps1
# ════════════════════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  DATUM TRAVELS - Setup Entorno de Desarrollo" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════
# 1. Verificar si Docker está corriendo
# ═══════════════════════════════════════════════════════════════════════
Write-Host "[1/5] Verificando Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Docker no está corriendo" -ForegroundColor Red
    Write-Host "   Por favor inicia Docker Desktop y vuelve a ejecutar este script" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker está corriendo" -ForegroundColor Green
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════
# 2. Verificar si ya existe contenedor Oracle
# ═══════════════════════════════════════════════════════════════════════
Write-Host "[2/5] Verificando contenedores existentes..." -ForegroundColor Yellow
$existingContainer = docker ps -a --filter "name=datum-oracle-dev" --format "{{.Names}}"
if ($existingContainer) {
    Write-Host "⚠️  Contenedor 'datum-oracle-dev' ya existe" -ForegroundColor Yellow
    $response = Read-Host "¿Deseas eliminarlo y crear uno nuevo? (S/N)"
    if ($response -eq "S" -or $response -eq "s") {
        Write-Host "   Eliminando contenedor existente..." -ForegroundColor Yellow
        docker-compose -f docker-compose-dev.yml down -v
        Write-Host "✅ Contenedor eliminado" -ForegroundColor Green
    } else {
        Write-Host "   Usando contenedor existente" -ForegroundColor Cyan
    }
}
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════
# 3. Levantar Oracle XE
# ═══════════════════════════════════════════════════════════════════════
Write-Host "[3/5] Levantando Oracle XE 21c..." -ForegroundColor Yellow
Write-Host "   Puerto: 1522" -ForegroundColor Cyan
Write-Host "   Usuario: datum_user" -ForegroundColor Cyan
Write-Host "   Password: datum2025" -ForegroundColor Cyan
Write-Host "   Database: XEPDB1" -ForegroundColor Cyan
Write-Host ""
Write-Host "   ⏳ Esto puede tomar 1-2 minutos..." -ForegroundColor Yellow

docker-compose -f docker-compose-dev.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR al levantar Oracle" -ForegroundColor Red
    exit 1
}
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════
# 4. Esperar a que Oracle esté listo
# ═══════════════════════════════════════════════════════════════════════
Write-Host "[4/5] Esperando a que Oracle esté listo..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$isHealthy = $false

while ($attempt -lt $maxAttempts -and -not $isHealthy) {
    $attempt++
    Write-Host "   Intento $attempt/$maxAttempts..." -ForegroundColor Cyan
    
    $health = docker inspect --format='{{.State.Health.Status}}' datum-oracle-dev 2>$null
    
    if ($health -eq "healthy") {
        $isHealthy = $true
        Write-Host "✅ Oracle está listo!" -ForegroundColor Green
    } else {
        Start-Sleep -Seconds 10
    }
}

if (-not $isHealthy) {
    Write-Host "⚠️  Oracle no respondió en el tiempo esperado" -ForegroundColor Yellow
    Write-Host "   Puedes verificar los logs con:" -ForegroundColor Cyan
    Write-Host "   docker-compose -f docker-compose-dev.yml logs -f datum-db" -ForegroundColor White
    Write-Host ""
}
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════
# 5. Mostrar información de conexión
# ═══════════════════════════════════════════════════════════════════════
Write-Host "[5/5] Información de Conexión" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 JDBC URL:" -ForegroundColor Green
Write-Host "   jdbc:oracle:thin:@localhost:1522/XEPDB1" -ForegroundColor White
Write-Host ""
Write-Host "👤 Credenciales:" -ForegroundColor Green
Write-Host "   Usuario: datum_user" -ForegroundColor White
Write-Host "   Password: datum2025" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Comandos útiles:" -ForegroundColor Green
Write-Host "   Ver logs:       docker-compose -f docker-compose-dev.yml logs -f" -ForegroundColor White
Write-Host "   Detener:        docker-compose -f docker-compose-dev.yml down" -ForegroundColor White
Write-Host "   Reiniciar:      docker-compose -f docker-compose-dev.yml restart" -ForegroundColor White
Write-Host "   Conectar SQL:   docker exec -it datum-oracle-dev sqlplus datum_user/datum2025@XEPDB1" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Siguiente paso:" -ForegroundColor Green
Write-Host "   cd BackEnd\quarkus-api" -ForegroundColor White
Write-Host "   .\mvnw quarkus:dev" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
