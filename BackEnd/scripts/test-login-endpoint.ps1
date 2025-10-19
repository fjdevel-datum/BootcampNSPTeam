# Test Login Endpoint
# Probar autenticación contra AuthResource

$baseUrl = "http://localhost:8080"
$loginUrl = "$baseUrl/api/auth/login"

# Credenciales de prueba (desde seed data)
$credentials = @{
    usuario = "cmartinez"
    password = "carlos123"
} | ConvertTo-Json

Write-Host "🔐 Probando Login Endpoint" -ForegroundColor Cyan
Write-Host "URL: $loginUrl"
Write-Host "Body: $credentials`n"

try {
    $response = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $credentials -ContentType "application/json"
    
    Write-Host "✅ LOGIN EXITOSO!" -ForegroundColor Green
    Write-Host "`n📋 Respuesta completa:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
    Write-Host "`n👤 Datos del Usuario:" -ForegroundColor Cyan
    Write-Host "- ID Empleado: $($response.idEmpleado)"
    Write-Host "- Nombre: $($response.nombre)"
    Write-Host "- Apellido: $($response.apellido)"
    Write-Host "- Email: $($response.email)"
    Write-Host "- Cargo: $($response.cargo)"
    Write-Host "- Departamento: $($response.departamento)"
    
    Write-Host "`n🔑 Token JWT:" -ForegroundColor Cyan
    if ($response.token) {
        Write-Host "- Token (primeros 50 chars): $($response.token.Substring(0, [Math]::Min(50, $response.token.Length)))..."
        Write-Host "- Longitud: $($response.token.Length) caracteres"
        
        # Guardar token en archivo
        $response.token | Out-File -FilePath "token.txt" -Encoding UTF8
        Write-Host "`n💾 Token guardado en: token.txt" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No se recibió token JWT" -ForegroundColor Yellow
    }
    
    # Probar endpoint /me con el token
    if ($response.token) {
        Write-Host "`n🔍 Probando endpoint /api/auth/me..." -ForegroundColor Cyan
        
        $headers = @{
            "Authorization" = "Bearer $($response.token)"
        }
        
        try {
            $meResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers $headers
            Write-Host "✅ Endpoint /me funciona correctamente" -ForegroundColor Green
            Write-Host "Respuesta:" -ForegroundColor Yellow
            $meResponse | ConvertTo-Json -Depth 10 | Write-Host
        } catch {
            Write-Host "⚠️ Endpoint /me no disponible (normal si OIDC está deshabilitado)" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n✅ TEST COMPLETADO" -ForegroundColor Green
    
} catch {
    Write-Host "❌ ERROR en el login!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Mensaje: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "`nRespuesta del servidor:" -ForegroundColor Yellow
        Write-Host $responseBody
    }
}

Write-Host "`n" -NoNewline
Read-Host "Presiona Enter para continuar"
