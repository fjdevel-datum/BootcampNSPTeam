# 🚀 INICIO RÁPIDO - PWA en Red Local

## ⚡ 3 PASOS PARA ACCEDER DESDE TU CELULAR

### 📱 URL desde Celular
```
http://192.168.1.6:5173
```

---

## 🎯 PASO 1: Configurar Firewall (Solo la primera vez)

**Ejecuta como ADMINISTRADOR:**
```powershell
.\configurar-firewall.ps1
```

O manualmente:
```powershell
# Ejecutar PowerShell como Administrador
New-NetFirewallRule -DisplayName "Datum - Vite" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow -Profile Private
New-NetFirewallRule -DisplayName "Datum - Backend" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow -Profile Private
New-NetFirewallRule -DisplayName "Datum - Keycloak" -Direction Inbound -LocalPort 8180 -Protocol TCP -Action Allow -Profile Private
```

---

## 🎯 PASO 2: Configurar Keycloak (Solo la primera vez)

1. Abre: http://localhost:8180
2. Login: `admin` / `admin2025`
3. Clients → `datum-travels-frontend` → Settings
4. **Valid Redirect URIs** - AGREGAR:
   ```
   http://192.168.1.6:5173/*
   ```
5. **Web Origins** - AGREGAR:
   ```
   http://192.168.1.6:5173
   ```
6. Click **Save**

---

## 🎯 PASO 3: Iniciar Servicios

### Opción A: Script Automático ⭐ RECOMENDADO
```powershell
.\iniciar-stack-lan.ps1
```

### Opción B: Manual

**Terminal 1 - Docker:**
```powershell
docker-compose -f docker-compose-dev.yml up -d
```

**Terminal 2 - Backend:**
```powershell
cd BackEnd\quarkus-api
.\mvnw quarkus:dev
```

**Terminal 3 - Frontend:**
```powershell
cd FrontEnd\frontend
.\iniciar-lan.ps1
```

---

## 📱 PROBAR DESDE CELULAR

1. Conecta tu celular a la **misma WiFi** que tu PC
2. Abre Chrome/Safari
3. Ve a: `http://192.168.1.6:5173`
4. ¡Listo! 🎉

### Instalar como PWA:
- **Android:** Menú (⋮) → "Agregar a pantalla de inicio"
- **iOS:** Compartir  → "Agregar a pantalla de inicio"

---

## 🔧 SI ALGO NO FUNCIONA

### ❌ No puedo conectar desde el celular

**Verificar:**
1. ✅ Celular y PC están en la **misma WiFi**
2. ✅ Frontend muestra: `Network: http://192.168.1.6:5173`
3. ✅ Firewall está configurado (ver Paso 1)
4. ✅ Tu red WiFi es **Privada** (no Pública)

**Verificar tipo de red:**
- Configuración → Red e Internet → WiFi → [Tu Red]
- Debe decir: "Perfil de red: **Privado**"

### ❌ Error de CORS

**Ya está configurado**, pero si persiste:
1. Verifica `BackEnd/quarkus-api/src/main/resources/application.properties`
2. Debe tener:
   ```properties
   quarkus.http.cors.origins=http://localhost:5173,http://192.168.1.6:5173
   ```
3. Reinicia el backend

### ❌ Error de Keycloak: Invalid redirect_uri

1. Repite el **Paso 2** (Configurar Keycloak)
2. Asegúrate de hacer click en **Save**
3. Recarga la página en el celular

### ❌ Mi IP cambió

Si cambias de WiFi, tu IP puede cambiar:

1. Obtén nueva IP:
   ```powershell
   ipconfig | findstr "IPv4"
   ```

2. Actualiza `FrontEnd/frontend/.env`:
   ```bash
   VITE_KEYCLOAK_HOST=192.168.X.X  # Nueva IP
   VITE_KEYCLOAK_URL=http://192.168.X.X:8180
   VITE_API_BASE_URL=http://192.168.X.X:8081/api
   ```

3. Actualiza Keycloak (Paso 2)

4. Actualiza `application.properties`:
   ```properties
   quarkus.http.cors.origins=http://localhost:5173,http://192.168.X.X:5173
   ```

5. Reinicia Backend y Frontend

---

## 📚 DOCUMENTACIÓN COMPLETA

Para más detalles, ver: **GUIA_PWA_LAN.md**

---

## ✅ VERIFICAR QUE TODO FUNCIONA

### Desde tu PC:
- ✅ Frontend: http://localhost:5173
- ✅ Backend: http://localhost:8081/q/swagger-ui
- ✅ Keycloak: http://localhost:8180

### Desde tu Celular:
- ✅ Frontend: http://192.168.1.6:5173

---

**¡Listo para usar tu PWA! 🎉**
