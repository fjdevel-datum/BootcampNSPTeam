# ============================================================================
# SCRIPT: Iniciar Frontend en Red Local (LAN)
# ============================================================================
# Descripción: Levanta Vite con acceso desde la red local (0.0.0.0)
# Uso desde celular: http://192.168.1.6:5173
# ============================================================================

Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   DATUM TRAVELS - INICIO EN RED LOCAL (LAN)            ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Copiar configuración LAN
Write-Host "🔧 Configurando modo LAN (192.168.1.6)..." -ForegroundColor Cyan
Copy-Item .env.lan .env -Force

Write-Host "✅ Configuración aplicada:" -ForegroundColor Green
Write-Host "   - Keycloak: http://192.168.1.6:8180" -ForegroundColor White
Write-Host "   - Backend: http://192.168.1.6:8081" -ForegroundColor White
Write-Host "   - OCR: http://192.168.1.6:8080" -ForegroundColor White
Write-Host "   - Frontend: http://192.168.1.6:5173" -ForegroundColor White
Write-Host ""

# Mostrar IP local
Write-Host "🌐 IP Local de tu PC:" -ForegroundColor Green
ipconfig | findstr /i "IPv4" | Select-String "192.168"
Write-Host ""

Write-Host "📱 ACCESO DESDE CELULAR:" -ForegroundColor Magenta
Write-Host "   1. Conecta tu celular a la misma WiFi" -ForegroundColor White
Write-Host "   2. Abre el navegador en: http://192.168.1.6:5173" -ForegroundColor Yellow
Write-Host ""

Write-Host "🚀 Iniciando Vite en modo LAN..." -ForegroundColor Cyan
Write-Host ""

# Iniciar Vite con host 0.0.0.0 para acceso desde red local
npm run dev -- --host 0.0.0.0
