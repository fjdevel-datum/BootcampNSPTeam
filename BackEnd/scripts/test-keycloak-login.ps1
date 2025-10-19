# Test Keycloak Authentication
# Obtener token JWT para usuario cmartinez

$keycloakUrl = "http://localhost:8180"
$realm = "datum-travels"
$clientId = "datum-travels-backend"
$clientSecret = "REEMPLAZAR_CON_CLIENT_SECRET"  # ← Copiar desde Keycloak
$username = "cmartinez"
$password = "carlos123"

$tokenUrl = "$keycloakUrl/realms/$realm/protocol/openid-connect/token"

$body = @{
    grant_type    = "password"
    client_id     = $clientId
    client_secret = $clientSecret
    username      = $username
    password      = $password
    scope         = "openid profile email"
}

Write-Host "🔐 Solicitando token JWT para usuario: $username" -ForegroundColor Cyan
Write-Host "URL: $tokenUrl`n"

try {
    $response = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
    
    Write-Host "✅ Autenticación exitosa!" -ForegroundColor Green
    Write-Host "`n📝 Access Token (primeros 100 caracteres):"
    Write-Host $response.access_token.Substring(0, 100)...
    
    Write-Host "`n⏰ Información del token:"
    Write-Host "- Expira en: $($response.expires_in) segundos ($($response.expires_in / 60) minutos)"
    Write-Host "- Refresh token expira en: $($response.refresh_expires_in) segundos"
    Write-Host "- Token type: $($response.token_type)"
    
    # Decodificar el payload del JWT (base64)
    $tokenParts = $response.access_token.Split('.')
    $payload = $tokenParts[1]
    
    # Agregar padding si es necesario
    while ($payload.Length % 4 -ne 0) {
        $payload += "="
    }
    
    $payloadJson = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($payload))
    $payloadObject = $payloadJson | ConvertFrom-Json
    
    Write-Host "`n👤 Información del usuario:"
    Write-Host "- Username: $($payloadObject.preferred_username)"
    Write-Host "- Email: $($payloadObject.email)"
    Write-Host "- Nombre: $($payloadObject.given_name) $($payloadObject.family_name)"
    Write-Host "- Roles: $($payloadObject.realm_access.roles -join ', ')"
    
    Write-Host "`n💾 Token guardado en: token.txt"
    $response.access_token | Out-File -FilePath "token.txt" -Encoding UTF8
    
} catch {
    Write-Host "❌ Error en la autenticación!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Mensaje: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody"
    }
}
