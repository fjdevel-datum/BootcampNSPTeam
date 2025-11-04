# ============================================================================
# Script de Prueba: Conversión de Monedas en Gastos
# ============================================================================
# Propósito: Verificar que los campos de conversión de moneda se guarden
#            correctamente en la base de datos
# ============================================================================

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   PRUEBA: Conversión de Monedas" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Configuración
$BACKEND_URL = "http://localhost:8081/api"
$TEST_USER = "carlos"
$TEST_PASS = "Carlos@2025"
$KEYCLOAK_URL = "http://localhost:8180/realms/datum-travels/protocol/openid-connect/token"

# Paso 1: Obtener token de autenticación
Write-Host "[1/4] Obteniendo token de autenticación..." -ForegroundColor Yellow

$tokenBody = @{
    grant_type = "password"
    client_id = "datum-app"
    username = $TEST_USER
    password = $TEST_PASS
}

try {
    $tokenResponse = Invoke-RestMethod -Uri $KEYCLOAK_URL -Method POST -Body $tokenBody -ContentType "application/x-www-form-urlencoded"
    $token = $tokenResponse.access_token
    Write-Host "✓ Token obtenido exitosamente" -ForegroundColor Green
} catch {
    Write-Host "✗ Error obteniendo token: $_" -ForegroundColor Red
    exit 1
}

# Paso 2: Crear un gasto de prueba con moneda extranjera (GTQ)
Write-Host "`n[2/4] Creando gasto de prueba en GTQ (Quetzales)..." -ForegroundColor Yellow

$gastoPayload = @{
    NombreEmpresa = "Restaurante El Portal, Guatemala City"
    Descripcion = "Almuerzo con cliente - Reunion negocios"
    MontoTotal = "390.00"
    Moneda = "GTQ"
    Fecha = "2025-11-03"
    IdEvento = 15
    IdCategoria = 2
    IdTarjeta = 3
} | ConvertTo-Json

Write-Host "Payload enviado:" -ForegroundColor Gray
Write-Host $gastoPayload -ForegroundColor Gray

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $gastoResponse = Invoke-RestMethod -Uri "$BACKEND_URL/gastos/llm" -Method POST -Headers $headers -Body $gastoPayload
    $gastoId = $gastoResponse.id
    Write-Host "✓ Gasto creado con ID: $gastoId" -ForegroundColor Green
} catch {
    Write-Host "✗ Error creando gasto: $_" -ForegroundColor Red
    Write-Host "Detalles: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

# Paso 3: Consultar el gasto creado para verificar los campos de conversión
Write-Host "`n[3/4] Consultando gasto creado (ID: $gastoId)..." -ForegroundColor Yellow

# Esperar un momento para que se complete la conversión
Start-Sleep -Seconds 2

try {
    $gastoDetalle = Invoke-RestMethod -Uri "$BACKEND_URL/gastos/$gastoId" -Method GET -Headers $headers
    
    Write-Host "`n============================================" -ForegroundColor Cyan
    Write-Host "   RESULTADO DE LA CONVERSIÓN" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    
    Write-Host "`nDatos Originales:" -ForegroundColor Yellow
    Write-Host "  Monto Original: $($gastoDetalle.monto) $($gastoDetalle.moneda)" -ForegroundColor White
    
    Write-Host "`nDatos Convertidos:" -ForegroundColor Yellow
    
    if ($null -eq $gastoDetalle.montoUsd) {
        Write-Host "  ✗ Monto USD: NULL (ERROR - No se calculó)" -ForegroundColor Red
    } else {
        Write-Host "  ✓ Monto USD: $($gastoDetalle.montoUsd) USD" -ForegroundColor Green
    }
    
    if ($null -eq $gastoDetalle.tasaCambio) {
        Write-Host "  ✗ Tasa de Cambio: NULL (ERROR - No se consultó)" -ForegroundColor Red
    } else {
        Write-Host "  ✓ Tasa de Cambio: $($gastoDetalle.tasaCambio)" -ForegroundColor Green
    }
    
    if ($null -eq $gastoDetalle.fechaTasaCambio) {
        Write-Host "  ✗ Fecha Tasa: NULL (ERROR - No se registró)" -ForegroundColor Red
    } else {
        Write-Host "  ✓ Fecha Tasa: $($gastoDetalle.fechaTasaCambio)" -ForegroundColor Green
    }
    
    Write-Host "`n============================================`n" -ForegroundColor Cyan
    
    # Verificación final
    if ($null -ne $gastoDetalle.montoUsd -and $null -ne $gastoDetalle.tasaCambio -and $null -ne $gastoDetalle.fechaTasaCambio) {
        Write-Host "✓ PRUEBA EXITOSA: Todos los campos de conversión se guardaron correctamente" -ForegroundColor Green
        
        # Calcular la conversión esperada
        $tasaEsperada = 0.128205
        $montoUsdEsperado = 390.00 * $tasaEsperada
        
        Write-Host "`nValidación de cálculo:" -ForegroundColor Yellow
        Write-Host "  Tasa esperada (aprox): $tasaEsperada" -ForegroundColor Gray
        Write-Host "  Monto USD esperado (aprox): $([math]::Round($montoUsdEsperado, 2)) USD" -ForegroundColor Gray
        Write-Host "  Monto USD calculado: $($gastoDetalle.montoUsd) USD" -ForegroundColor Gray
        
        if ([math]::Abs([double]$gastoDetalle.montoUsd - $montoUsdEsperado) -lt 1.0) {
            Write-Host "  ✓ La conversión es correcta (diferencia < 1 USD)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ La conversión difiere del valor esperado" -ForegroundColor Yellow
            Write-Host "    (Esto puede ser normal si la API usa tasas en tiempo real)" -ForegroundColor Gray
        }
        
    } else {
        Write-Host "✗ PRUEBA FALLIDA: Algunos campos de conversión son NULL" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "✗ Error consultando gasto: $_" -ForegroundColor Red
    exit 1
}

# Paso 4: Prueba adicional con USD (no debería hacer conversión)
Write-Host "`n[4/4] Prueba adicional: Gasto en USD (sin conversión)..." -ForegroundColor Yellow

$gastoUsdPayload = @{
    NombreEmpresa = "Airport Hotel"
    Descripcion = "Hospedaje en aeropuerto"
    MontoTotal = "150.00"
    Moneda = "USD"
    Fecha = "2025-11-03"
    IdEvento = 15
    IdCategoria = 3
    IdTarjeta = 3
} | ConvertTo-Json

try {
    $gastoUsdResponse = Invoke-RestMethod -Uri "$BACKEND_URL/gastos/llm" -Method POST -Headers $headers -Body $gastoUsdPayload
    $gastoUsdId = $gastoUsdResponse.id
    
    Start-Sleep -Seconds 1
    
    $gastoUsdDetalle = Invoke-RestMethod -Uri "$BACKEND_URL/gastos/$gastoUsdId" -Method GET -Headers $headers
    
    Write-Host "`nGasto en USD:" -ForegroundColor Yellow
    Write-Host "  Monto Original: $($gastoUsdDetalle.monto) $($gastoUsdDetalle.moneda)" -ForegroundColor White
    Write-Host "  Monto USD: $($gastoUsdDetalle.montoUsd) USD" -ForegroundColor White
    
    if ([double]$gastoUsdDetalle.monto -eq [double]$gastoUsdDetalle.montoUsd) {
        Write-Host "  ✓ USD: Monto original = Monto USD (correcto)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ USD: Los montos deberían ser iguales" -ForegroundColor Red
    }
    
} catch {
    Write-Host "⚠ Error en prueba de USD (no crítico): $_" -ForegroundColor Yellow
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   PRUEBAS COMPLETADAS" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan
