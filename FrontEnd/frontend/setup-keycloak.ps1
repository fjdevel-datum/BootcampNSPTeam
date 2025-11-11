# Script para configurar el frontend con Keycloak
# Ejecutar desde: FrontEnd/frontend/

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "   Configuración Frontend + Keycloak" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encuentra package.json" -ForegroundColor Red
    Write-Host "   Por favor ejecuta este script desde: FrontEnd/frontend/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Directorio correcto detectado" -ForegroundColor Green
Write-Host ""

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    Write-Host "   Descarga desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Limpiar instalación previa (opcional)
Write-Host "¿Deseas limpiar instalación previa? (S/N)" -ForegroundColor Yellow
$clean = Read-Host
if ($clean -eq "S" -or $clean -eq "s") {
    Write-Host "Limpiando node_modules y package-lock.json..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
    Write-Host "✅ Limpieza completada" -ForegroundColor Green
}

Write-Host ""

# Instalar dependencias
Write-Host "Instalando dependencias..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
Write-Host ""

# Crear archivo .env si no existe
if (-not (Test-Path ".env")) {
    Write-Host "Creando archivo .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Archivo .env creado" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Archivo .env ya existe" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "   ✅ Configuración Completada" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configurar Keycloak (ver KEYCLOAK_QUICK_START.md)" -ForegroundColor White
Write-Host "   - Crear client: datum-travels-frontend" -ForegroundColor Gray
Write-Host "   - Crear roles: admin, user" -ForegroundColor Gray
Write-Host "   - Crear usuarios de prueba" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Iniciar el frontend:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Abrir en navegador:" -ForegroundColor White
Write-Host "   http://localhost:5173" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentación:" -ForegroundColor Yellow
Write-Host "   - KEYCLOAK_QUICK_START.md (configuración rápida)" -ForegroundColor White
Write-Host "   - KEYCLOAK_FRONTEND_INTEGRATION.md (guía completa)" -ForegroundColor White
Write-Host ""
