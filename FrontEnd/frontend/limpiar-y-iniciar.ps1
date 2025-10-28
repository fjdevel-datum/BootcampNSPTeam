# Limpiar todo y reiniciar
Remove-Item -Recurse -Force node_modules/.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .vite -ErrorAction SilentlyContinue

Write-Host "Cache limpiado. Iniciando servidor..." -ForegroundColor Green
npm run dev
