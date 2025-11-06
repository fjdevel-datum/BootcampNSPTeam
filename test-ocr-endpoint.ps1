# ============================================================================
# TEST: Verificar endpoint de descarga de archivos OCR
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [int]$GastoId = 32
)

Write-Host "Probando endpoint OCR para gasto ID: $GastoId" -ForegroundColor Cyan
Write-Host ""

# 1. Obtener token de Keycloak
Write-Host "[1/3] Obteniendo token JWT de Keycloak..." -ForegroundColor Yellow

$keycloakUrl = "http://localhost:8180/realms/datum-travels/protocol/openid-connect/token"
$body = @{
    grant_type = "password"
    client_id = "datum-travels-frontend"
    username = "carlos"
    password = "carlos123"
}

try {
    $response = Invoke-RestMethod -Uri $keycloakUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
    $token = $response.access_token
    
    if ($token) {
        Write-Host "  Token obtenido: $($token.Substring(0, 50))..." -ForegroundColor Green
        
        # Decodificar el token para ver el issuer
        $tokenParts = $token.Split('.')
        $payload = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($tokenParts[1] + "=="))
        $payloadObj = $payload | ConvertFrom-Json
        Write-Host "  Issuer del token: $($payloadObj.iss)" -ForegroundColor Cyan
    } else {
        throw "No se obtuvo token"
    }
} catch {
    Write-Host "  ERROR: No se pudo obtener el token" -ForegroundColor Red
    Write-Host "  $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Probar endpoint directo del OCR (sin proxy)
Write-Host "[2/3] Probando endpoint directo OCR (puerto 8080)..." -ForegroundColor Yellow

$ocrUrl = "http://localhost:8080/api/gastos/$GastoId/archivo"
$headers = @{
    Authorization = "Bearer $token"
}

try {
    $ocrResponse = Invoke-WebRequest -Uri $ocrUrl -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "  STATUS: $($ocrResponse.StatusCode) OK" -ForegroundColor Green
    Write-Host "  Content-Type: $($ocrResponse.Headers.'Content-Type')" -ForegroundColor Cyan
    Write-Host "  Content-Length: $($ocrResponse.RawContentLength) bytes" -ForegroundColor Cyan
} catch {
    Write-Host "  ERROR: $($_.Exception.Response.StatusCode.value__) - $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    Write-Host "  $_" -ForegroundColor Red
}

Write-Host ""

# 3. Probar endpoint a través del proxy de Vite (puerto 5173)
Write-Host "[3/3] Probando endpoint a traves del proxy Vite (puerto 5173)..." -ForegroundColor Yellow

$viteUrl = "http://localhost:5173/api/gastos/$GastoId/archivo"

try {
    $viteResponse = Invoke-WebRequest -Uri $viteUrl -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "  STATUS: $($viteResponse.StatusCode) OK" -ForegroundColor Green
    Write-Host "  Content-Type: $($viteResponse.Headers.'Content-Type')" -ForegroundColor Cyan
    Write-Host "  Content-Length: $($viteResponse.RawContentLength) bytes" -ForegroundColor Cyan
} catch {
    Write-Host "  ERROR: $($_.Exception.Response.StatusCode.value__) - $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    Write-Host "  $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test completado." -ForegroundColor Green
