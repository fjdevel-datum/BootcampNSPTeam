# ============================================================================
# COMANDOS RÁPIDOS - Configurar Firewall (Copiar y Pegar)
# ============================================================================
# Ejecutar en PowerShell como ADMINISTRADOR
# ============================================================================

# Puerto 5173 - Frontend Vite
New-NetFirewallRule -DisplayName "Datum Travels - Vite" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow -Profile Private,Domain

# Puerto 8081 - Backend Quarkus  
New-NetFirewallRule -DisplayName "Datum Travels - Backend" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow -Profile Private,Domain

# Puerto 8180 - Keycloak
New-NetFirewallRule -DisplayName "Datum Travels - Keycloak" -Direction Inbound -LocalPort 8180 -Protocol TCP -Action Allow -Profile Private,Domain

# Puerto 8080 - OCR Microservice
New-NetFirewallRule -DisplayName "Datum Travels - OCR" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow -Profile Private,Domain

# Verificar que se crearon
Get-NetFirewallRule -DisplayName "Datum*" | Select-Object DisplayName, Enabled | Format-Table -AutoSize

Write-Host ""
Write-Host "✅ Firewall configurado correctamente!" -ForegroundColor Green
Write-Host "✅ Puertos abiertos: 5173, 8081, 8180, 8080" -ForegroundColor Green
