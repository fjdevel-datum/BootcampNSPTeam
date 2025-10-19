# ════════════════════════════════════════════════════════════
# SCRIPT DE SETUP COMPLETO - DATUM TRAVELS
# ════════════════════════════════════════════════════════════

Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   DATUM TRAVELS - Setup Base de Datos Completo       ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Copiar script al contenedor
Write-Host "📦 Paso 1: Copiando script SQL al contenedor..." -ForegroundColor Yellow
docker cp "BackEnd/scripts/init-db-complete.sql" datum-app-db:/tmp/init-db-complete.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Script copiado exitosamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al copiar el script" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Paso 2: Ejecutar script SQL
Write-Host "🗄️  Paso 2: Ejecutando script SQL en Oracle..." -ForegroundColor Yellow
Write-Host "   (Esto puede tomar 10-15 segundos)" -ForegroundColor Gray
Write-Host ""

docker exec -i datum-app-db bash -c "sqlplus -S datum_user/datum2025@XEPDB1 @/tmp/init-db-complete.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Base de datos configurada exitosamente" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Error al ejecutar el script SQL" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           ✅ SETUP COMPLETADO EXITOSAMENTE            ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Paso 3: Mostrar resumen
Write-Host "📊 RESUMEN DE DATOS INSERTADOS:" -ForegroundColor Cyan
Write-Host "   • 3 Países (El Salvador, Guatemala, Honduras)" -ForegroundColor White
Write-Host "   • 1 Empresa (Datum Red Soft)" -ForegroundColor White
Write-Host "   • 3 Departamentos (Tecnología, RRHH, Finanzas)" -ForegroundColor White
Write-Host "   • 3 Cargos" -ForegroundColor White
Write-Host "   • 3 Empleados (Carlos, Ana, Luis)" -ForegroundColor White
Write-Host "   • 3 Usuarios (cmartinez, arodriguez, lgonzalez)" -ForegroundColor White
Write-Host "   • 4 Categorías de Gasto" -ForegroundColor White
Write-Host "   • 1 Evento de prueba" -ForegroundColor White
Write-Host ""

Write-Host "🔐 CREDENCIALES DE PRUEBA:" -ForegroundColor Cyan
Write-Host "   Usuario: cmartinez" -ForegroundColor Yellow
Write-Host "   Contraseña: carlos123" -ForegroundColor Yellow
Write-Host ""

Write-Host "🚀 SIGUIENTE PASO:" -ForegroundColor Magenta
Write-Host "   Ejecuta: powershell -ExecutionPolicy Bypass -File 'BackEnd\scripts\test-login-simple.ps1'" -ForegroundColor White
Write-Host ""
