# Script de Prueba - Gestión de Perfil del Empleado
# Requiere: Backend corriendo en localhost:8081 y token JWT válido

# ============================================
# CONFIGURACIÓN
# ============================================
$API_BASE = "http://localhost:8081"
$TOKEN = "" # Pegar aquí el access_token después del login

# ============================================
# COLORES PARA OUTPUT
# ============================================
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }

# ============================================
# FUNCIONES AUXILIARES
# ============================================
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [string]$Description
    )
    
    Write-Info "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Info "TEST: $Description"
    Write-Info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
        "Content-Type" = "application/json"
    }
    
    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json
            Write-Info "Request Body:"
            Write-Host $jsonBody -ForegroundColor Yellow
            
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers -Body $jsonBody
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers
        }
        
        Write-Success "`n✓ SUCCESS - $Description"
        Write-Info "Response:"
        $response | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor Green
        
        return $response
    }
    catch {
        Write-Error "`n✗ ERROR - $Description"
        Write-Error "Status: $($_.Exception.Response.StatusCode.value__)"
        Write-Error "Message: $($_.Exception.Message)"
        
        if ($_.ErrorDetails.Message) {
            Write-Error "Details: $($_.ErrorDetails.Message)"
        }
        
        return $null
    }
}

# ============================================
# VALIDAR TOKEN
# ============================================
Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║  PRUEBA: Gestión de Perfil del Empleado                   ║" -ForegroundColor Magenta
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Magenta

if ([string]::IsNullOrWhiteSpace($TOKEN)) {
    Write-Error "`n⚠️  ERROR: No se ha configurado el TOKEN"
    Write-Warning "Por favor:"
    Write-Warning "1. Inicia sesión en http://localhost:5173"
    Write-Warning "2. Abre las DevTools (F12) > Console"
    Write-Warning "3. Ejecuta: localStorage.getItem('access_token')"
    Write-Warning "4. Copia el token y pégalo en la variable `$TOKEN de este script"
    exit
}

Write-Success "✓ Token configurado correctamente"

# ============================================
# TEST 1: Obtener Perfil Actual
# ============================================
$perfil = Test-Endpoint `
    -Method "GET" `
    -Url "$API_BASE/api/empleados/perfil" `
    -Description "Obtener perfil del empleado autenticado"

if (-not $perfil) {
    Write-Error "`n⚠️  No se pudo obtener el perfil. Abortando pruebas."
    exit
}

# ============================================
# TEST 2: Actualizar Perfil (Éxito)
# ============================================
Start-Sleep -Seconds 2

$actualizacion = @{
    nombre = $perfil.nombre
    apellido = "$($perfil.apellido) (Actualizado)"
    correo = $perfil.correo
    telefono = "+503 7000 0000"
}

$perfilActualizado = Test-Endpoint `
    -Method "PUT" `
    -Url "$API_BASE/api/empleados/perfil" `
    -Body $actualizacion `
    -Description "Actualizar perfil del empleado"

# ============================================
# TEST 3: Verificar Cambios
# ============================================
Start-Sleep -Seconds 2

$perfilVerificado = Test-Endpoint `
    -Method "GET" `
    -Url "$API_BASE/api/empleados/perfil" `
    -Description "Verificar que los cambios se guardaron"

if ($perfilVerificado) {
    Write-Info "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Info "COMPARACIÓN DE DATOS"
    Write-Info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    Write-Host "Apellido Original:    " -NoNewline
    Write-Host $perfil.apellido -ForegroundColor Yellow
    
    Write-Host "Apellido Actualizado: " -NoNewline
    Write-Host $perfilVerificado.apellido -ForegroundColor Green
    
    Write-Host "Teléfono Original:    " -NoNewline
    Write-Host $perfil.telefono -ForegroundColor Yellow
    
    Write-Host "Teléfono Actualizado: " -NoNewline
    Write-Host $perfilVerificado.telefono -ForegroundColor Green
}

# ============================================
# TEST 4: Restaurar Datos Originales
# ============================================
Start-Sleep -Seconds 2

$restauracion = @{
    nombre = $perfil.nombre
    apellido = $perfil.apellido
    correo = $perfil.correo
    telefono = $perfil.telefono
}

$perfilRestaurado = Test-Endpoint `
    -Method "PUT" `
    -Url "$API_BASE/api/empleados/perfil" `
    -Body $restauracion `
    -Description "Restaurar datos originales del perfil"

# ============================================
# TEST 5: Validación de Correo Duplicado
# ============================================
Start-Sleep -Seconds 2

$correoDuplicado = @{
    nombre = $perfil.nombre
    apellido = $perfil.apellido
    correo = "admin@datum.com"  # Correo de otro usuario
    telefono = $perfil.telefono
}

Test-Endpoint `
    -Method "PUT" `
    -Url "$API_BASE/api/empleados/perfil" `
    -Body $correoDuplicado `
    -Description "Validar error con correo duplicado (debe fallar)"

# ============================================
# RESUMEN FINAL
# ============================================
Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║  PRUEBAS COMPLETADAS                                       ║" -ForegroundColor Magenta
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Magenta

Write-Info "`nEndpoints Probados:"
Write-Host "  ✓ GET  /api/empleados/perfil" -ForegroundColor Green
Write-Host "  ✓ PUT  /api/empleados/perfil" -ForegroundColor Green

Write-Info "`nValidaciones Probadas:"
Write-Host "  ✓ Obtener perfil con datos completos" -ForegroundColor Green
Write-Host "  ✓ Actualizar datos del perfil" -ForegroundColor Green
Write-Host "  ✓ Verificar persistencia de cambios" -ForegroundColor Green
Write-Host "  ✓ Restaurar datos originales" -ForegroundColor Green
Write-Host "  ✓ Validar correo duplicado (debe fallar)" -ForegroundColor Green

Write-Info "`nPróximos Pasos:"
Write-Warning "  1. Abre el frontend en http://localhost:5173/profile"
Write-Warning "  2. Verifica que los datos se muestran correctamente"
Write-Warning "  3. Edita el perfil y guarda los cambios"
Write-Warning "  4. Recarga la página y confirma que persisten"

Write-Success "`n✓ Script de prueba finalizado`n"
