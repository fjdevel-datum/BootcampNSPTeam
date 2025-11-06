# ⚡ COMANDOS RÁPIDOS - Día de Presentación

## 🎯 OPCIÓN 1: Script Automático (RECOMENDADO)

```powershell
# Ejecutar como ADMINISTRADOR
.\setup-presentacion.ps1
```

**Hace TODO automáticamente:**
- ✅ Detecta tu nueva IP
- ✅ Actualiza archivos de configuración
- ✅ Configura Firewall
- ✅ Verifica Docker
- ✅ Te guía para configurar Keycloak
- ✅ Opcionalmente inicia Backend y Frontend

**Tiempo:** 2 minutos

---

## 🎯 OPCIÓN 2: Comandos Manuales (Paso a paso)

### 1️⃣ Detectar IP
```powershell
ipconfig | findstr "IPv4" | findstr "192.168"
```
**Anota la IP:** `________________`

---

### 2️⃣ Configurar Firewall (PowerShell ADMIN)
```powershell
New-NetFirewallRule -DisplayName "Datum Travels - Vite" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow -Profile Private,Domain; New-NetFirewallRule -DisplayName "Datum Travels - Backend" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow -Profile Private,Domain; New-NetFirewallRule -DisplayName "Datum Travels - Keycloak" -Direction Inbound -LocalPort 8180 -Protocol TCP -Action Allow -Profile Private,Domain; New-NetFirewallRule -DisplayName "Datum Travels - OCR" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow -Profile Private,Domain
```

---

### 3️⃣ Actualizar Frontend (.env)

**Archivo:** `FrontEnd/frontend/.env`

**Cambiar solo la IP:**
```bash
VITE_KEYCLOAK_HOST=TU_NUEVA_IP_AQUI
VITE_KEYCLOAK_URL=http://TU_NUEVA_IP_AQUI:8180
VITE_API_BASE_URL=http://TU_NUEVA_IP_AQUI:8081/api
```

---

### 4️⃣ Actualizar Backend (application.properties)

**Archivo:** `BackEnd/quarkus-api/src/main/resources/application.properties`

**Buscar línea:**
```properties
quarkus.http.cors.origins=http://localhost:5173,http://192.168.1.6:5173
```

**Agregar tu nueva IP:**
```properties
quarkus.http.cors.origins=http://localhost:5173,http://192.168.1.6:5173,http://TU_NUEVA_IP:5173
```

---

### 5️⃣ Iniciar Docker
```powershell
docker-compose -f docker-compose-dev.yml up -d
```

**Esperar 1-2 minutos**

---

### 6️⃣ Configurar Keycloak

1. Abrir: http://localhost:8180
2. Login: `admin` / `admin2025`
3. Clients → `datum-travels-frontend` → Settings
4. **Valid Redirect URIs** → Agregar:
   ```
   http://TU_NUEVA_IP:5173/*
   ```
5. **Web Origins** → Agregar:
   ```
   http://TU_NUEVA_IP:5173
   ```
6. **Save**

---

### 7️⃣ Iniciar Backend (Terminal 1)
```powershell
cd BackEnd\quarkus-api
.\mvnw quarkus:dev
```

**Esperar:** `Listening on: http://0.0.0.0:8081`

---

### 8️⃣ Iniciar Frontend (Terminal 2)
```powershell
cd FrontEnd\frontend
npm run dev -- --host 0.0.0.0
```

**Esperar:** `Network: http://TU_IP:5173/`

---

### 9️⃣ Probar desde Celular

**URL:** `http://TU_IP:5173`

**Login:** `carlos` / `carlos123`

---

## 🆘 EMERGENCIAS

### Si algo falla:

**Comando mágico (reinicia todo):**
```powershell
# Detener
docker-compose -f docker-compose-dev.yml down

# Ctrl+C en Backend y Frontend

# Volver a empezar desde Paso 5
```

---

## ⏱️ TIEMPOS

| Opción | Tiempo |
|--------|--------|
| **Script automático** | 2-3 min |
| **Comandos manuales** | 10-13 min |

---

## 📋 CHECKLIST ANTES DE PRESENTAR

- [ ] WiFi conectado
- [ ] Docker corriendo
- [ ] Firewall configurado
- [ ] Keycloak configurado
- [ ] Backend corriendo (`Listening on 8081`)
- [ ] Frontend corriendo (`Network: http://...`)
- [ ] Celular en misma WiFi
- [ ] Login funciona en celular

**Todo OK = Listo para presentar! 🎉**
