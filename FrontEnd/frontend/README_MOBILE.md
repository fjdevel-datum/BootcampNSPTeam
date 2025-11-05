# Run frontend + backend for mobile testing

This short guide explains how to run both backend (Quarkus) and frontend (Vite) configured to be reachable from other devices on your LAN (phone/tablet).

Prerequisites
- Java + Maven (for backend)
- Node.js + npm (for frontend)
- Ensure ports 8081 (backend), 8180 (Keycloak) and 5173 (frontend) are reachable from your mobile device and not blocked by firewall.

Quick start (PowerShell)
1. From repository root run the helper script (it will attempt to auto-detect your machine IP):

```powershell
# From repository root
scripts\start-dev-mobile.ps1
```

2. Or provide the IP explicitly:

```powershell
scripts\start-dev-mobile.ps1 -DevIP 192.168.1.28
```

What the script does
- Starts Quarkus in a new PowerShell window with `KEYCLOAK_HOST` and `FRONTEND_ORIGINS` set to the selected IP so the backend accepts tokens issued for that host and allows CORS from the frontend origin.
- Starts Vite in a new PowerShell window with `VITE_API_BASE_URL`, `VITE_KEYCLOAK_URL` and `VITE_KEYCLOAK_HOST` set to the selected IP so the frontend requests Keycloak and backend using the machine IP (accessible from mobile).

Manual alternative (if you prefer):

1) Start backend with env vars (example):

```powershell
$Env:KEYCLOAK_HOST='192.168.1.28'
$Env:FRONTEND_ORIGINS='http://192.168.1.28:5173'
cd BackEnd\quarkus-api
.\mvnw quarkus:dev
```

2) Start frontend:

```powershell
cd FrontEnd\frontend
# set env for this process only
$Env:VITE_API_BASE_URL='http://192.168.1.28:8081/api'
$Env:VITE_KEYCLOAK_URL='http://192.168.1.28:8180'
$Env:VITE_KEYCLOAK_HOST='192.168.1.28'
npm run dev
```

Verification steps
- From your mobile open: `http://<dev-ip>:5173`, login and check the events list.
- If login fails, make sure you can open `http://<dev-ip>:8180` (Keycloak admin console) from the phone.
- If events return 401: check backend console logs for OIDC validation errors (issuer mismatch or signature issues).

Troubleshooting
- If Keycloak is not reachable from mobile, check Windows Firewall and any VPN that may isolate interfaces.
- If token issuer (`iss`) differs from what backend expects, ensure `KEYCLOAK_HOST` is set correctly before starting backend.
- For CORS issues, add `FRONTEND_ORIGINS='http://<dev-ip>:5173'` before starting Quarkus.

If you want, I can also add a tiny script that stops both processes or docker-compose tasks for a more advanced flow.