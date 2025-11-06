# ============================================================================
# SCRIPT: Configurar Firewall de Windows para Red Local
# ============================================================================
# Descripción: Permite el acceso a los puertos necesarios desde la red local
# NOTA: Debe ejecutarse como ADMINISTRADOR
# ============================================================================

# Verificar si se está ejecutando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║   ⚠️  ESTE SCRIPT REQUIERE PERMISOS DE ADMINISTRADOR   ║" -ForegroundColor Red
    Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, cierra esta ventana y:" -ForegroundColor Yellow
    Write-Host "  1. Click derecho en PowerShell" -ForegroundColor White
    Write-Host "  2. Selecciona 'Ejecutar como administrador'" -ForegroundColor White
    Write-Host "  3. Navega a este directorio y ejecuta el script de nuevo" -ForegroundColor White
    Write-Host ""
    Read-Host "Presiona ENTER para salir"
    exit 1
}

Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   CONFIGURAR FIREWALL PARA RED LOCAL                   ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Puertos a abrir
$puertos = @(
    @{ Puerto = 5173; Nombre = "Vite Dev Server (Frontend)"; Descripcion = "Permite acceso al frontend desde celular" },
    @{ Puerto = 8081; Nombre = "Quarkus Backend API"; Descripcion = "Permite acceso a la API desde celular" },
    @{ Puerto = 8180; Nombre = "Keycloak Auth Server"; Descripcion = "Permite autenticación desde celular" },
    @{ Puerto = 8080; Nombre = "OCR Microservice"; Descripcion = "Permite procesamiento OCR desde celular" }
)

Write-Host "📋 Puertos a configurar:" -ForegroundColor Yellow
Write-Host ""

foreach ($config in $puertos) {
    Write-Host "  • Puerto $($config.Puerto): $($config.Nombre)" -ForegroundColor White
}

Write-Host ""
Write-Host "¿Deseas continuar? (s/n)" -ForegroundColor Magenta
$respuesta = Read-Host

if ($respuesta -ne "s" -and $respuesta -ne "S") {
    Write-Host "Operación cancelada" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔥 Configurando Firewall de Windows..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

foreach ($config in $puertos) {
    $puerto = $config.Puerto
    $nombreRegla = "Datum Travels - $($config.Nombre)"
    
    Write-Host "⚙️  Configurando puerto $puerto..." -ForegroundColor Yellow
    
    # Verificar si la regla ya existe
    $reglaExistente = Get-NetFirewallRule -DisplayName $nombreRegla -ErrorAction SilentlyContinue
    
    if ($reglaExistente) {
        Write-Host "   ℹ️  La regla '$nombreRegla' ya existe. Eliminando..." -ForegroundColor Gray
        Remove-NetFirewallRule -DisplayName $nombreRegla
    }
    
    # Crear nueva regla de entrada (Inbound)
    try {
        New-NetFirewallRule `
            -DisplayName $nombreRegla `
            -Description $config.Descripcion `
            -Direction Inbound `
            -LocalPort $puerto `
            -Protocol TCP `
            -Action Allow `
            -Profile Private,Domain `
            -Enabled True | Out-Null
        
        Write-Host "   ✅ Puerto $puerto configurado correctamente" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Error al configurar puerto $puerto : $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Configuración completada" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📌 NOTAS IMPORTANTES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  • Las reglas se crearon solo para redes 'Privadas' y 'Dominio'" -ForegroundColor White
Write-Host "  • NO se permite acceso desde redes 'Públicas' por seguridad" -ForegroundColor White
Write-Host "  • Asegúrate de que tu WiFi esté configurada como red 'Privada'" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Para verificar tu tipo de red:" -ForegroundColor Cyan
Write-Host "   1. Configuración de Windows → Red e Internet" -ForegroundColor White
Write-Host "   2. Click en tu WiFi actual" -ForegroundColor White
Write-Host "   3. Debe decir 'Perfil de red: Privado'" -ForegroundColor White
Write-Host ""
Write-Host "📋 Para ver las reglas creadas:" -ForegroundColor Cyan
Write-Host '   Get-NetFirewallRule -DisplayName "Datum Travels*"' -ForegroundColor White
Write-Host ""

Read-Host "Presiona ENTER para salir"
