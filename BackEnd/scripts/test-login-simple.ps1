# Test Login Endpoint - Version Simple
$baseUrl = "http://localhost:8080"
$loginUrl = "$baseUrl/api/auth/login"

$credentials = @{
    usuarioApp = "cmartinez"
    contrasena = "carlos123"
} | ConvertTo-Json

Write-Host "Probando Login Endpoint" -ForegroundColor Cyan
Write-Host "URL: $loginUrl"
Write-Host "Body: $credentials"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $credentials -ContentType "application/json"
    
    Write-Host "LOGIN EXITOSO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Respuesta completa:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "ERROR en el login!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Mensaje: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Respuesta del servidor:"
        Write-Host $responseBody
    }
}
