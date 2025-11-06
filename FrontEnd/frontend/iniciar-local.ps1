# ============================================================================
# INICIAR MODO LOCAL - Desarrollo en localhost
# ============================================================================
# Este script configura el frontend para usar localhost
# Acceso: http://localhost:5173
# ============================================================================

Write-Host "Configurando modo LOCAL (localhost)..." -ForegroundColor Cyan

# Copiar configuración local
Copy-Item .env.local .env -Force

Write-Host "Configuracion aplicada:" -ForegroundColor Green
Write-Host "   - Keycloak: http://localhost:8180" -ForegroundColor White
Write-Host "   - Backend: http://localhost:8081" -ForegroundColor White
Write-Host "   - OCR: http://localhost:8080" -ForegroundColor White
Write-Host "   - Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""

# Preguntar si quiere iniciar el servidor
$iniciar = Read-Host "Iniciar el servidor de desarrollo? (S/N)"
if ($iniciar -eq "S" -or $iniciar -eq "s") {
    Write-Host "Iniciando servidor..." -ForegroundColor Cyan
    npm run dev
} else {
    Write-Host "Recuerda ejecutar 'npm run dev' para iniciar el servidor" -ForegroundColor Yellow
}
