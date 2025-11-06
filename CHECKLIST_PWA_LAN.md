# ✅ CHECKLIST - Configuración PWA Red Local

## 🎯 CONFIGURACIÓN INICIAL (Solo una vez)

### ☐ 1. Configurar Firewall de Windows
```powershell
# Ejecutar como ADMINISTRADOR
.\configurar-firewall.ps1
```
**Resultado esperado:** "✅ Configuración completada"

---

### ☐ 2. Verificar servicios Docker
```powershell
docker-compose -f docker-compose-dev.yml up -d
```

**Verificar que estén corriendo:**
```powershell
docker ps
```

Debes ver:
- ☐ `datum-oracle-dev` (puerto 1522)
- ☐ `datum-keycloak-dev` (puerto 8180)  
- ☐ `datum-openkm` (puerto 8087)

---

### ☐ 3. Configurar Keycloak

**URL:** http://localhost:8180  
**Login:** `admin` / `admin2025`

**Pasos:**
1. ☐ Clients → `datum-travels-frontend`
2. ☐ Tab: **Settings**
3. ☐ **Valid Redirect URIs** → Click "Add"
   ```
   http://192.168.1.6:5173/*
   ```
4. ☐ **Web Origins** → Click "Add"
   ```
   http://192.168.1.6:5173
   ```
5. ☐ Click **Save** (parte inferior)
6. ☐ Verificar que aparece mensaje: "Success! Client successfully saved"

---

### ☐ 4. Verificar archivos de configuración

**Frontend - `.env`:**
```bash
# Archivo: FrontEnd/frontend/.env
VITE_KEYCLOAK_HOST=192.168.1.6
VITE_KEYCLOAK_URL=http://192.168.1.6:8180
VITE_API_BASE_URL=http://192.168.1.6:8081/api
```
- ☐ Archivo existe
- ☐ IP es correcta (192.168.1.6)

**Backend - `application.properties`:**
```properties
# Archivo: BackEnd/quarkus-api/src/main/resources/application.properties
quarkus.http.cors.origins=http://localhost:5173,http://192.168.1.6:5173
quarkus.oidc.token.issuer=any
```
- ☐ CORS incluye la IP local
- ☐ Token issuer está en "any"

---

## 🚀 INICIO DIARIO (Cada vez que uses la app)

### ☐ 5. Levantar Backend

**Terminal 1:**
```powershell
cd BackEnd\quarkus-api
.\mvnw quarkus:dev
```

**Esperar a ver:**
```
Listening on: http://0.0.0.0:8081
```
- ☐ Backend inició sin errores
- ☐ Muestra "0.0.0.0:8081" (no solo localhost)

---

### ☐ 6. Levantar Frontend

**Terminal 2:**
```powershell
cd FrontEnd\frontend
.\iniciar-lan.ps1
```

**O manualmente:**
```powershell
npm run dev -- --host 0.0.0.0
```

**Esperar a ver:**
```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.6:5173/
```
- ☐ Frontend inició sin errores
- ☐ Muestra línea "Network" con IP 192.168.1.6

---

### ☐ 7. (Opcional) Levantar OCR

**Terminal 3:**
```powershell
cd ocr-quarkus
.\mvnw quarkus:dev
```

**Esperar a ver:**
```
Listening on: http://0.0.0.0:8080
```
- ☐ OCR inició sin errores

---

## 📱 PROBAR DESDE CELULAR

### ☐ 8. Conectar celular a WiFi
- ☐ Celular conectado a la **misma WiFi** que la PC
- ☐ WiFi es la misma red (nombre idéntico)

---

### ☐ 9. Abrir en navegador del celular

**URL:** `http://192.168.1.6:5173`

**Verificaciones:**
- ☐ La página carga correctamente
- ☐ Se ve el logo de Datum Travels
- ☐ Aparece el formulario de login

---

### ☐ 10. Probar Login

**Credenciales de prueba:**
- Usuario: `carlos` / Contraseña: `carlos123`
- O cualquier usuario que tengas en Keycloak

**Verificaciones:**
- ☐ Login funciona correctamente
- ☐ Redirige a la página principal
- ☐ Se muestran los eventos/datos

---

### ☐ 11. Instalar PWA (Opcional)

**Android (Chrome):**
1. ☐ Click en menú (⋮)
2. ☐ "Agregar a pantalla de inicio"
3. ☐ Click "Instalar"
4. ☐ Ícono aparece en pantalla de inicio

**iOS (Safari):**
1. ☐ Click en botón compartir ()
2. ☐ "Agregar a pantalla de inicio"
3. ☐ Click "Agregar"
4. ☐ Ícono aparece en pantalla de inicio

---

## 🔍 VERIFICACIÓN FINAL

### ☐ 12. Probar funcionalidades principales

**Desde el celular:**
- ☐ Crear un nuevo evento
- ☐ Ver lista de eventos
- ☐ Agregar un gasto
- ☐ Subir una foto de comprobante
- ☐ Ver el perfil de usuario
- ☐ Hacer logout y volver a login

---

## ⚠️ TROUBLESHOOTING

### Si no puedes conectar desde el celular:

**Verificar Firewall:**
```powershell
Get-NetFirewallRule -DisplayName "Datum*"
```
- ☐ Aparecen 4 reglas
- ☐ Todas están "Enabled: True"

**Verificar tipo de red WiFi:**
- ☐ Configuración → Red e Internet → WiFi
- ☐ Click en tu red actual
- ☐ Debe decir: "Perfil de red: **Privado**"

**Verificar IP actual:**
```powershell
ipconfig | findstr "IPv4"
```
- ☐ La IP sigue siendo 192.168.1.6
- ☐ Si cambió, actualizar archivos de configuración

**Verificar servicios corriendo:**
```powershell
# Backend
curl http://localhost:8081/q/health/live

# Frontend
curl http://localhost:5173

# Keycloak  
curl http://localhost:8180
```
- ☐ Todos responden correctamente

---

## 📊 ESTADO ACTUAL

**Fecha última configuración:** _________________

**IP Local actual:** `192.168.1.6`

**Servicios configurados:**
- ✅ Docker (Oracle, Keycloak, OpenKM)
- ✅ Backend Quarkus
- ✅ Frontend React + Vite
- ⚠️ OCR (opcional)

**Puertos abiertos en Firewall:**
- ✅ 5173 (Frontend)
- ✅ 8081 (Backend)
- ✅ 8180 (Keycloak)
- ✅ 8080 (OCR)

**URLs de acceso:**
- PC: http://localhost:5173
- Celular: http://192.168.1.6:5173

---

**✅ Configuración completada exitosamente!**
