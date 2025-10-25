# ═══════════════════════════════════════════════════════════════════════
# SETUP COMPLETO AUTOMATIZADO - Datum Travels
# ═══════════════════════════════════════════════════════════════════════
# Descripción:
#   Script maestro que ejecuta TODOS los pasos necesarios para levantar
#   el proyecto desde cero después de clonar el repositorio.
#
# Prerequisitos:
#   - Docker Desktop instalado y corriendo
#   - Java 21 instalado
#   - PowerShell 5.1 o superior
#
# Uso:
#   .\setup-completo-automatico.ps1
# ═══════════════════════════════════════════════════════════════════════

param(
    [switch]$SkipDocker,
    [switch]$SkipDatabase,
    [switch]$SkipKeycloak,
    [switch]$SkipBackend
)

$ErrorActionPreference = "Stop"

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       🚀 SETUP AUTOMÁTICO - DATUM TRAVELS 🚀           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "Este script configurará automáticamente:" -ForegroundColor Yellow
Write-Host "  1. Contenedores Docker (Oracle + Keycloak)" -ForegroundColor White
Write-Host "  2. Base de datos Oracle (esquema + usuarios)" -ForegroundColor White
Write-Host "  3. Keycloak (realm + usuarios con roles)" -ForegroundColor White
Write-Host "  4. Backend Quarkus`n" -ForegroundColor White

Write-Host "⏱️  Tiempo estimado: ~5 minutos`n" -ForegroundColor Green

$respuesta = Read-Host "¿Continuar? (S/N)"
if ($respuesta -ne "S" -and $respuesta -ne "s") {
    Write-Host "❌ Setup cancelado por el usuario`n" -ForegroundColor Yellow
    exit 0
}

# ═══════════════════════════════════════════════════════════════════════
# PASO 1: Verificar prerequisitos
# ═══════════════════════════════════════════════════════════════════════

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📋 PASO 1: Verificando prerequisitos..." -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Verificar Docker
Write-Host "🐳 Verificando Docker..." -ForegroundColor White
try {
    $dockerVersion = docker --version
    Write-Host "   ✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker no encontrado. Instala Docker Desktop" -ForegroundColor Red
    exit 1
}

# Verificar Java
Write-Host "☕ Verificando Java..." -ForegroundColor White
try {
    $javaVersion = java -version 2>&1 | Select-String "version" | Select-Object -First 1
    Write-Host "   ✅ Java encontrado: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Java no encontrado. Instala Java 21" -ForegroundColor Red
    exit 1
}

# ═══════════════════════════════════════════════════════════════════════
# PASO 2: Levantar Docker Compose
# ═══════════════════════════════════════════════════════════════════════

if (-not $SkipDocker) {
    Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "🐳 PASO 2: Levantando contenedores Docker..." -ForegroundColor Yellow
    Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

    Write-Host "Ejecutando: docker-compose -f docker-compose-dev.yml up -d" -ForegroundColor Gray
    docker-compose -f docker-compose-dev.yml up -d

    Write-Host "`n⏳ Esperando a que los servicios estén listos (60 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 60

    # Verificar servicios
    Write-Host "`n📊 Estado de contenedores:" -ForegroundColor White
    docker ps --filter "name=datum" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    Write-Host "`n✅ Docker Compose levantado correctamente`n" -ForegroundColor Green
}

# ═══════════════════════════════════════════════════════════════════════
# PASO 3: Configurar Base de Datos Oracle
# ═══════════════════════════════════════════════════════════════════════

if (-not $SkipDatabase) {
    Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "💾 PASO 3: Configurando Base de Datos Oracle..." -ForegroundColor Yellow
    Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

    Write-Host "3.1. Creando esquema y tablas..." -ForegroundColor White
    Get-Content "BD DATUM FINAL.sql" | docker exec -i datum-oracle-dev sqlplus -S system/oracle@XEPDB1
    Write-Host "   ✅ Esquema creado`n" -ForegroundColor Green

    Write-Host "3.2. Insertando usuarios de prueba..." -ForegroundColor White
    Get-Content "BackEnd\scripts\insertar-usuarios-prueba-completo.sql" | docker exec -i datum-oracle-dev sqlplus -S datum_user/datum2025@XEPDB1
    Write-Host "   ✅ 4 usuarios creados en Oracle`n" -ForegroundColor Green

    Write-Host "✅ Base de datos configurada correctamente`n" -ForegroundColor Green
}

# ═══════════════════════════════════════════════════════════════════════
# PASO 4: Configurar Keycloak
# ═══════════════════════════════════════════════════════════════════════

if (-not $SkipKeycloak) {
    Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "🔐 PASO 4: Configurando Keycloak..." -ForegroundColor Yellow
    Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

    Write-Host "4.1. Creando usuarios en Keycloak..." -ForegroundColor White
    .\crear-usuarios-keycloak.ps1
    Write-Host "`n   ✅ Usuarios creados en Keycloak`n" -ForegroundColor Green

    Write-Host "✅ Keycloak configurado correctamente`n" -ForegroundColor Green
}

# ═══════════════════════════════════════════════════════════════════════
# PASO 5: Verificar configuración
# ═══════════════════════════════════════════════════════════════════════

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🧪 PASO 5: Verificando configuración..." -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Verificar servicios
$keycloakHealth = try { 
    Invoke-WebRequest -Uri "http://localhost:8180/health/ready" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    $true 
} catch { 
    $false 
}

$oracleHealth = try {
    docker exec datum-oracle-dev sqlplus -S datum_user/datum2025@XEPDB1 -c "SELECT 1 FROM dual;" > $null
    $true
} catch {
    $false
}

Write-Host "Keycloak: " -NoNewline -ForegroundColor White
if ($keycloakHealth) {
    Write-Host "✅ HEALTHY" -ForegroundColor Green
} else {
    Write-Host "❌ NO RESPONDE" -ForegroundColor Red
}

Write-Host "Oracle:   " -NoNewline -ForegroundColor White
if ($oracleHealth) {
    Write-Host "✅ HEALTHY" -ForegroundColor Green
} else {
    Write-Host "❌ NO RESPONDE" -ForegroundColor Red
}

# ═══════════════════════════════════════════════════════════════════════
# RESUMEN FINAL
# ═══════════════════════════════════════════════════════════════════════

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              🎉 SETUP COMPLETADO 🎉                     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "✅ Servicios configurados:" -ForegroundColor Green
Write-Host "   • Keycloak:  http://localhost:8180" -ForegroundColor White
Write-Host "   • Oracle:    localhost:1522 (datum_user/datum2025@XEPDB1)`n" -ForegroundColor White

Write-Host "✅ Usuarios de prueba disponibles:" -ForegroundColor Green
Write-Host "   • carlos.test / test123 (Empleado)" -ForegroundColor White
Write-Host "   • maria.contador / contador123 (contador)" -ForegroundColor White
Write-Host "   • juan.gerente / gerente123 (gerente)" -ForegroundColor White
Write-Host "   • admin.datum / admin123 (admin)`n" -ForegroundColor White

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "🚀 PRÓXIMOS PASOS:`n" -ForegroundColor Yellow

Write-Host "1. Levantar el backend:" -ForegroundColor White
Write-Host "   cd BackEnd\quarkus-api" -ForegroundColor Gray
Write-Host "   .\mvnw quarkus:dev`n" -ForegroundColor Gray

Write-Host "2. Probar login:" -ForegroundColor White
Write-Host '   $body = @{usuarioApp="carlos.test"; contrasena="test123"} | ConvertTo-Json' -ForegroundColor Gray
Write-Host '   Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" \' -ForegroundColor Gray
Write-Host '     -Method POST -Body $body -ContentType "application/json"`n' -ForegroundColor Gray

Write-Host "3. Levantar el frontend (opcional):" -ForegroundColor White
Write-Host "   cd FrontEnd\frontend" -ForegroundColor Gray
Write-Host "   npm install" -ForegroundColor Gray
Write-Host "   npm run dev`n" -ForegroundColor Gray

Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Yellow

Write-Host "📚 Documentación: SETUP_COMPLETO.md" -ForegroundColor Cyan
Write-Host "🧪 Credenciales: USUARIOS_PRUEBA.md`n" -ForegroundColor Cyan

Write-Host "🎉 ¡Listo para desarrollar!" -ForegroundColor Green -BackgroundColor Black
Write-Host ""
