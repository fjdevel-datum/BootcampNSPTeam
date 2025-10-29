# ============================================
# Script PowerShell para ejecutar la migración
# Agrega el campo keycloak_id a la tabla Usuario
# ============================================

Write-Host "🔧 Ejecutando migración: Agregar keycloak_id a Usuario" -ForegroundColor Cyan
Write-Host ""

# Configuración (AJUSTA ESTOS VALORES)
$ORACLE_USER = "DATUM_USER"      # ← Cambia si usas otro usuario
$ORACLE_PASS = "123"              # ← Cambia tu contraseña
$ORACLE_HOST = "localhost:1522"   # ← Tu puerto dockerizado
$ORACLE_SERVICE = "XEPDB1"        # ← Tu servicio/SID

# Ruta al script SQL
$SCRIPT_PATH = Join-Path $PSScriptRoot "add-keycloak-id.sql"

# Comando SQL*Plus
$SQL_COMMAND = "sqlplus $ORACLE_USER/$ORACLE_PASS@//$ORACLE_HOST/$ORACLE_SERVICE @`"$SCRIPT_PATH`""

Write-Host "📡 Conectando a: $ORACLE_HOST/$ORACLE_SERVICE" -ForegroundColor Yellow
Write-Host "👤 Usuario: $ORACLE_USER" -ForegroundColor Yellow
Write-Host "📄 Script: $SCRIPT_PATH" -ForegroundColor Yellow
Write-Host ""

# Ejecutar
try {
    Invoke-Expression $SQL_COMMAND
    Write-Host ""
    Write-Host "✅ Migración completada" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ Error al ejecutar migración: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
