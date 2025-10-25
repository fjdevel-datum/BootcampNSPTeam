# ════════════════════════════════════════════════════════════════════════════
# Script: Configurar Java 21 como predeterminado
# ════════════════════════════════════════════════════════════════════════════

$javaHome = "C:\OpenJDK21U-jdk_x64_windows_hotspot_21.0.8_9\jdk-21.0.8+9"

Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " Configurando Java 21 " -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Configurar JAVA_HOME para el usuario actual
Write-Host "1. Configurando JAVA_HOME..." -ForegroundColor Green
[Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, "User")

# Obtener PATH actual del usuario
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")

# Remover rutas antiguas de Java del PATH
Write-Host "2. Limpiando PATH de versiones antiguas de Java..." -ForegroundColor Green
$pathArray = $userPath -split ";"
$cleanedPath = $pathArray | Where-Object { 
    $_ -notlike "*\jdk-*\bin*" -and 
    $_ -notlike "*Eclipse Adoptium*" -and
    $_ -notlike "*Java\java-*" 
}

# Agregar Java 21 al inicio del PATH
Write-Host "3. Agregando Java 21 al PATH..." -ForegroundColor Green
$newPath = "$javaHome\bin;" + ($cleanedPath -join ";")
[Environment]::SetEnvironmentVariable("Path", $newPath, "User")

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " Configuración completada! " -ForegroundColor Green
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE: Debes CERRAR y ABRIR una nueva terminal de PowerShell" -ForegroundColor Yellow
Write-Host "para que los cambios surtan efecto." -ForegroundColor Yellow
Write-Host ""
Write-Host "Después de abrir una nueva terminal, verifica con:" -ForegroundColor Cyan
Write-Host "  java -version" -ForegroundColor White
Write-Host ""
