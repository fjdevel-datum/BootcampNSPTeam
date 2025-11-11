Param(
    [string]$DevIP
)

# Dev helper to start backend (Quarkus) and frontend (Vite) configured to be reachable from other devices on your LAN.
# Usage: .\start-dev-mobile.ps1            -> attempts to auto-detect IP
#        .\start-dev-mobile.ps1 -DevIP 192.168.1.28

$ErrorActionPreference = 'Stop'

# Try to auto-detect an IPv4 address if not provided
if (-not $DevIP -or $DevIP.Trim() -eq '') {
    try {
        $addrs = Get-NetIPAddress -AddressFamily IPv4 |
                 Where-Object { $_.IPAddress -notmatch '^(127\.|169\.254\.)' -and $_.PrefixLength -gt 0 } |
                 Sort-Object -Property AddressFamily, PrefixLength
        if ($addrs -and $addrs.Count -gt 0) {
            $DevIP = $addrs[0].IPAddress
            Write-Host "Auto-detected IP: $DevIP"
        }
    } catch {
        # Fallback to localhost prompt
        Write-Host "No automatic IP detected. You can pass -DevIP <your-ip>"
    }
}

if (-not $DevIP -or $DevIP.Trim() -eq '') {
    $DevIP = Read-Host 'Enter the development machine IP reachable from your phone (e.g. 192.168.1.28)'
}

if (-not $DevIP -or $DevIP.Trim() -eq '') {
    Write-Error "No IP provided. Aborting."
    exit 1
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$BackendPath = Join-Path $RepoRoot 'BackEnd\quarkus-api'
$FrontendPath = Join-Path $RepoRoot 'FrontEnd\frontend'

# If a repo-level .env exists, load it and export values for this session.
$repoEnv = Join-Path $RepoRoot '.env'
if (Test-Path $repoEnv) {
    Write-Host "Loading repo .env from: $repoEnv"
    try {
        Get-Content $repoEnv | ForEach-Object {
            $line = $_.Trim()
            if ($line -and -not $line.StartsWith('#')) {
                $parts = $line -split '=', 2
                if ($parts.Count -eq 2) {
                    $key = $parts[0].Trim()
                    $val = $parts[1].Trim().Trim("'\"")
                    # Only set environment variable if not already set in the process
                    if (-not [string]::IsNullOrEmpty($key)) {
                        if (-not $Env:$key) {
                            $Env:$key = $val
                            Write-Host "Set env $key from repo .env"
                        } else {
                            Write-Host "Env $key already set in process, skipping repo .env value"
                        }
                    }
                }
            }
        }
    } catch {
        Write-Warning "Failed to load repo .env: $_"
    }
}

Write-Host "Using Dev IP: $DevIP"
Write-Host "Backend path: $BackendPath"
Write-Host "Frontend path: $FrontendPath"

# If repo .env provided a KEYCLOAK_HOST and no DevIP was provided, prefer that
if (-not $DevIP -or $DevIP.Trim() -eq '') {
    if ($Env:KEYCLOAK_HOST) {
        $DevIP = $Env:KEYCLOAK_HOST
        Write-Host "Using KEYCLOAK_HOST from repo .env as Dev IP: $DevIP"
    }
}

# Prepare environment values (prefer repo .env values, fallback to computed DevIP)
$backendKeycloakHost = if ($Env:KEYCLOAK_HOST) { $Env:KEYCLOAK_HOST } else { $DevIP }
$frontendOrigins = if ($Env:FRONTEND_ORIGINS) { $Env:FRONTEND_ORIGINS } else { "http://$DevIP:5173" }
$viteApiBase = if ($Env:VITE_API_BASE_URL) { $Env:VITE_API_BASE_URL } else { "http://$DevIP:8081/api" }
$viteKeycloakUrl = if ($Env:VITE_KEYCLOAK_URL) { $Env:VITE_KEYCLOAK_URL } else { "http://$DevIP:8180" }
$viteKeycloakHost = if ($Env:VITE_KEYCLOAK_HOST) { $Env:VITE_KEYCLOAK_HOST } else { $DevIP }

# Start Quarkus in a new PowerShell window
$backendCmd = "Set-Location -LiteralPath '$BackendPath'; `$Env:KEYCLOAK_HOST='$backendKeycloakHost'; `$Env:FRONTEND_ORIGINS='$frontendOrigins'; .\mvnw quarkus:dev"
Start-Process -FilePath powershell -ArgumentList '-NoExit', '-Command', $backendCmd
Write-Host "Started backend (Quarkus) in a new PowerShell window"

# Start frontend (Vite) in a new PowerShell window
$frontendCmd = "Set-Location -LiteralPath '$FrontendPath'; `$Env:VITE_API_BASE_URL='$viteApiBase'; `$Env:VITE_KEYCLOAK_URL='$viteKeycloakUrl'; `$Env:VITE_KEYCLOAK_HOST='$viteKeycloakHost'; npm run dev"
Start-Process -FilePath powershell -ArgumentList '-NoExit', '-Command', $frontendCmd
Write-Host "Started frontend (Vite) in a new PowerShell window"

Write-Host "Done. Open http://$DevIP:5173 on your mobile device and test the app."
