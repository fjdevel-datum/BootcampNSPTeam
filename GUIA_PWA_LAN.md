# 🚀 GUÍA RÁPIDA: PWA en Red Local (LAN)

## 📱 Acceso desde Celular
**URL:** `http://192.168.1.6:5173`

---

## ✅ CHECKLIST DE CONFIGURACIÓN

### 1️⃣ Levantar Servicios Docker (5 min)
```powershell
# En PowerShell desde la raíz del proyecto
docker-compose -f docker-compose-dev.yml up -d

# Verificar que estén corriendo
docker ps
```

**Esperar que estén healthy:**
- ✅ `datum-oracle-dev` (puerto 1522)
- ✅ `datum-keycloak-dev` (puerto 8180)
- ✅ `datum-openkm` (puerto 8087)

---

### 2️⃣ Configurar Keycloak (2 min) 🔐

**Acceder a:** http://localhost:8180

**Login:** `admin` / `admin2025`

**Pasos:**
1. Click en: **Clients** → `datum-travels-frontend`
2. Tab: **Settings**
3. En **Valid Redirect URIs**, AGREGAR:
   ```
   http://192.168.1.6:5173/*
   ```
4. En **Web Origins**, AGREGAR:
   ```
   http://192.168.1.6:5173
   ```
5. Click en **Save** ✅

**IMPORTANTE:** Si tu IP cambia (ej: cambias de WiFi), debes actualizar estos valores.

---

### 3️⃣ Iniciar Backend Quarkus (2 min)

```powershell
# Terminal 1: Backend
cd BackEnd\quarkus-api
.\mvnw quarkus:dev
```

**Esperar a ver:**
```
Listening on: http://0.0.0.0:8081
```

✅ Backend disponible en:
- Desde PC: http://localhost:8081
- Desde celular: http://192.168.1.6:8081

---

### 4️⃣ Iniciar Microservicio OCR (OPCIONAL - 2 min)

```powershell
# Terminal 2: OCR
cd ocr-quarkus
.\mvnw quarkus:dev
```

**Esperar a ver:**
```
Listening on: http://0.0.0.0:8080
```

✅ OCR disponible en:
- Desde PC: http://localhost:8080
- Desde celular: http://192.168.1.6:8080

---

### 5️⃣ Iniciar Frontend (1 min)

**OPCIÓN A: Script Automático** ⭐ RECOMENDADO
```powershell
# Terminal 3: Frontend (desde raíz del proyecto)
cd FrontEnd\frontend
.\iniciar-lan.ps1
```

**OPCIÓN B: Manual**
```powershell
cd FrontEnd\frontend
npm run dev -- --host 0.0.0.0
```

**Verás:**
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.6:5173/
```

---

## 📱 PROBAR DESDE EL CELULAR

### Paso 1: Conectar a WiFi
- Asegúrate de que tu celular esté en la **misma red WiFi** que tu PC
- Nombre de WiFi: [TU_RED_WIFI_ACTUAL]

### Paso 2: Abrir Navegador
Abre Chrome/Safari y ve a:
```
http://192.168.1.6:5173
```

### Paso 3: Instalar PWA (Opcional)
**En Android (Chrome):**
1. Click en los 3 puntos (⋮)
2. "Agregar a pantalla de inicio"
3. Click en "Instalar"

**En iOS (Safari):**
1. Click en botón de compartir 
2. "Agregar a pantalla de inicio"
3. Click en "Agregar"

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### ❌ "No se puede conectar desde el celular"

**Verificar Firewall de Windows:**
```powershell
# Verificar si el puerto 5173 está bloqueado
netstat -an | findstr 5173

# Permitir el puerto en Firewall (ejecutar como Administrador)
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Quarkus Backend" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Keycloak" -Direction Inbound -LocalPort 8180 -Protocol TCP -Action Allow
```

### ❌ "Error de CORS en el navegador"

**Solución:** Ya está configurado en `application.properties`:
```properties
quarkus.http.cors.origins=http://localhost:5173,http://192.168.1.6:5173
```

Si persiste, reinicia el backend:
```powershell
# Ctrl+C en la terminal del backend
.\mvnw quarkus:dev
```

### ❌ "Error de Keycloak: Invalid redirect_uri"

**Solución:** Repite el Paso 2 (Configurar Keycloak) y asegúrate de guardar.

### ❌ "Mi IP cambió"

Si cambias de red WiFi, tu IP local puede cambiar:

1. Obtén la nueva IP:
   ```powershell
   ipconfig | findstr "IPv4"
   ```

2. Actualiza el archivo `.env` del frontend:
   ```bash
   VITE_KEYCLOAK_HOST=192.168.X.X  # Nueva IP
   VITE_KEYCLOAK_URL=http://192.168.X.X:8180
   VITE_API_BASE_URL=http://192.168.X.X:8081/api
   ```

3. Actualiza Keycloak (Web Origins + Redirect URIs)

4. Reinicia el frontend

---

## 📊 VERIFICAR QUE TODO FUNCIONA

### Desde tu PC (localhost):
- ✅ Frontend: http://localhost:5173
- ✅ Backend: http://localhost:8081/q/swagger-ui
- ✅ Keycloak: http://localhost:8180
- ✅ OCR: http://localhost:8080/q/swagger-ui

### Desde tu Celular (IP local):
- ✅ Frontend: http://192.168.1.6:5173
- ✅ Backend API: http://192.168.1.6:8081/api/eventos
- ✅ Keycloak: http://192.168.1.6:8180

---

## 🎯 INICIO RÁPIDO - 1 COMANDO

**Script TODO EN UNO:**
```powershell
# Desde la raíz del proyecto
.\iniciar-stack-lan.ps1
```

Este script:
1. ✅ Verifica Docker
2. ✅ Inicia servicios Docker
3. ✅ Te guía para iniciar Backend
4. ✅ Te recuerda configurar Keycloak
5. ✅ Inicia el Frontend en modo LAN

---

## 📝 NOTAS IMPORTANTES

### Limitaciones de Red Local:
- ❌ **No funciona** si tu celular usa datos móviles (4G/5G)
- ❌ **No funciona** si estás en otra WiFi diferente
- ✅ **SÍ funciona** en la misma red WiFi
- ✅ **SÍ funciona** sin necesidad de internet externo

### Ventajas:
- 🚀 GRATIS (sin costos de hosting)
- ⚡ Rápido (sin latencia de internet)
- 🔒 Privado (los datos no salen de tu red local)
- 💪 Ideal para desarrollo y demos

### Para Acceso 24/7 desde Internet:
Necesitarás migrar a **Estrategia 3 (VPS)** - aprox $6 USD/mes

---

## 🆘 SOPORTE

Si algo no funciona, verifica:
1. ✅ Docker Desktop está corriendo
2. ✅ Los 3 contenedores están "healthy"
3. ✅ Backend Quarkus inició sin errores
4. ✅ Frontend Vite muestra "Network: http://192.168.1.6:5173"
5. ✅ Keycloak tiene configuradas las URLs con la IP local
6. ✅ Firewall de Windows permite los puertos 5173, 8081, 8180
7. ✅ Celular y PC están en la MISMA WiFi

---

**¡Listo para probar! 🎉**
