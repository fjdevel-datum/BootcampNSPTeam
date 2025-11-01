# Script para limpiar puerto 5173 y reiniciar frontend

Write-Host "🔍 Verificando puerto 5173..." -ForegroundColor Cyan

# Buscar procesos usando el puerto 5173
$port = 5173
$processInfo = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($processInfo) {
    Write-Host "⚠️  Puerto $port está ocupado" -ForegroundColor Yellow
    
    foreach ($conn in $processInfo) {
        $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "   Proceso: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Yellow
            
            $confirm = Read-Host "¿Deseas cerrar este proceso? (S/N)"
            if ($confirm -eq 'S' -or $confirm -eq 's') {
                Stop-Process -Id $process.Id -Force
                Write-Host "✅ Proceso terminado" -ForegroundColor Green
            }
        }
    }
} else {
    Write-Host "✅ Puerto $port está disponible" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Iniciando frontend..." -ForegroundColor Cyan
npm run dev
