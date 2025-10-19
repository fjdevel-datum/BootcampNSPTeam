# Test POST /api/eventos
$url = "http://localhost:8080/api/eventos"
$body = @{
    idEmpleado = 2
    nombreEvento = "Reunión Comercial Guatemala"
} | ConvertTo-Json

Write-Host "Enviando POST a $url"
Write-Host "Body: $body"

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
    Write-Host "SUCCESS!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "ERROR!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
    
    # Leer el cuerpo del error
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $reader.BaseStream.Position = 0
    $reader.DiscardBufferedData()
    $responseBody = $reader.ReadToEnd()
    Write-Host "Response Body: $responseBody"
}
