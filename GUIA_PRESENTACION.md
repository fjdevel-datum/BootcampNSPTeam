# 🎓 GUÍA: Presentación del Proyecto en Otro Lugar

## 📋 PREPARACIÓN (1 día antes en tu casa)

### ✅ Checklist Pre-Presentación

- [ ] Docker Desktop instalado y funcionando
- [ ] Todos los servicios probados en casa
- [ ] Credenciales anotadas (admin/admin2025, etc.)
- [ ] Scripts de inicio probados
- [ ] Usuarios de prueba creados en Keycloak
- [ ] Datos de ejemplo cargados en la BD

### 📦 Backup de datos (IMPORTANTE)

```powershell
# Crear carpeta de backup
mkdir backup-presentacion
cd backup-presentacion

# Exportar configuración de Keycloak
# (Entrar a http://localhost:8180 → Realm Settings → Action → Partial Export)

# Exportar datos de Oracle (opcional)
docker exec -it datum-oracle-dev bash -c "expdp datum_user/datum2025@XEPDB1 directory=DATA_PUMP_DIR dumpfile=backup.dmp full=y"
```

---

## 🚗 DÍA DE LA PRESENTACIÓN

### PASO 1: Llegar al lugar (Universidad/Empresa)

**Material que debes llevar:**
- ✅ Tu laptop con Docker Desktop instalado
- ✅ Cable de carga
- ✅ Tu celular
- ✅ Esta guía impresa o en el celular
- ✅ Credenciales anotadas

---

### PASO 2: Conectar a la red WiFi del lugar

```powershell
# Al conectarte a la nueva WiFi, ejecuta:
ipconfig | findstr "IPv4" | findstr "192.168"
```

**Anota la nueva IP. Ejemplo:**
```
IPv4 Address. . . . . . . . . . . : 192.168.0.105
                                    ↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                                    ESTA ES TU NUEVA IP
```

---

### PASO 3: Actualizar configuración (5 minutos)

#### 3.1 Actualizar Frontend (.env)

**Archivo:** `FrontEnd/frontend/.env`

```bash
# Cambia la IP antigua por la nueva:
VITE_KEYCLOAK_HOST=192.168.0.105        # ← Nueva IP
VITE_KEYCLOAK_URL=http://192.168.0.105:8180
VITE_API_BASE_URL=http://192.168.0.105:8081/api

# Estos quedan igual:
VITE_KEYCLOAK_REALM=datum-travels
VITE_KEYCLOAK_CLIENT_ID=datum-travels-frontend
VITE_PROXY_BACKEND=http://localhost:8081
VITE_PROXY_OCR=http://localhost:8080
```

#### 3.2 Actualizar Backend (application.properties)

**Archivo:** `BackEnd/quarkus-api/src/main/resources/application.properties`

Busca la línea:
```properties
quarkus.http.cors.origins=http://localhost:5173,http://192.168.1.6:5173
```

Agregar la nueva IP:
```properties
quarkus.http.cors.origins=http://localhost:5173,http://192.168.1.6:5173,http://192.168.0.105:5173
```

---

### PASO 4: Configurar Firewall (1 minuto)

**Abrir PowerShell como ADMINISTRADOR** y ejecutar:

```powershell
# Copiar y pegar TODO de una vez:
New-NetFirewallRule -DisplayName "Datum Travels - Vite" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow -Profile Private,Domain; New-NetFirewallRule -DisplayName "Datum Travels - Backend" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow -Profile Private,Domain; New-NetFirewallRule -DisplayName "Datum Travels - Keycloak" -Direction Inbound -LocalPort 8180 -Protocol TCP -Action Allow -Profile Private,Domain; New-NetFirewallRule -DisplayName "Datum Travels - OCR" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow -Profile Private,Domain; Write-Host "Firewall configurado!" -ForegroundColor Green
```

**Verificar:**
```powershell
Get-NetFirewallRule -DisplayName "Datum Travels*" | Select-Object DisplayName, Enabled
```

---

### PASO 5: Configurar Keycloak (2 minutos)

1. **Iniciar Docker:**
   ```powershell
   docker-compose -f docker-compose-dev.yml up -d
   ```

2. **Esperar 1-2 minutos** a que Keycloak inicie

3. **Abrir:** http://localhost:8180

4. **Login:** `admin` / `admin2025`

5. **Navegar a:**
   Clients → `datum-travels-frontend` → Settings

6. **En "Valid Redirect URIs" AGREGAR:**
   ```
   http://192.168.0.105:5173/*
   ```
   (Reemplazar 192.168.0.105 con TU nueva IP)

7. **En "Web Origins" AGREGAR:**
   ```
   http://192.168.0.105:5173
   ```

8. **Click en "Save"**

---

### PASO 6: Iniciar servicios (3 minutos)

#### Terminal 1: Backend
```powershell
cd BackEnd\quarkus-api
.\mvnw quarkus:dev
```

**Esperar a ver:**
```
Listening on: http://0.0.0.0:8081
```

#### Terminal 2: Frontend
```powershell
cd FrontEnd\frontend
npm run dev -- --host 0.0.0.0
```

**Esperar a ver:**
```
➜  Network: http://192.168.0.105:5173/
```

**⚠️ IMPORTANTE:** Anota la IP que muestra en "Network"

---

### PASO 7: Conectar celular (30 segundos)

1. **Conecta tu celular a la MISMA WiFi** que la laptop

2. **Abre navegador en el celular**

3. **Ve a:** `http://192.168.0.105:5173`
   (Usar la IP que anotaste en el Paso 6)

4. **Login con usuario de prueba:**
   - Usuario: `carlos`
   - Contraseña: `carlos123`

---

## 🎬 DURANTE LA PRESENTACIÓN

### Script de Demostración (5 minutos)

**1. Mostrar la interfaz web (laptop):**
   - "Esta es la versión de escritorio..."
   - Login y mostrar funcionalidades

**2. Mostrar en el celular:**
   - "Ahora desde el móvil, en la misma red..."
   - Abrir `http://192.168.0.105:5173`
   - Login y demostrar

**3. Crear un gasto desde el celular:**
   - "Imaginen que están en un viaje de negocios..."
   - Tomar foto del comprobante con la cámara
   - Subir y procesar con OCR
   - Mostrar que aparece al instante en ambos dispositivos

**4. Instalar PWA (bonus):**
   - Menú → "Agregar a pantalla de inicio"
   - Abrir desde el ícono (pantalla completa)

---

## 🆘 PROBLEMAS COMUNES

### ❌ "No puedo acceder desde el celular"

**Verificar:**
```powershell
# 1. Ver si frontend está en 0.0.0.0
# Debe mostrar "Network: http://192.168.X.X:5173"

# 2. Ver si el celular está en la misma WiFi
# Configuración → WiFi → Nombre debe coincidir

# 3. Ping desde la laptop al celular
ping 192.168.X.X  # IP del celular
```

**Solución rápida:**
- Reiniciar frontend con `--host 0.0.0.0`
- Verificar firewall de Windows está habilitado

---

### ❌ "Error de Keycloak: Invalid redirect_uri"

**Causa:** Olvidaste configurar Keycloak con la nueva IP

**Solución:**
1. http://localhost:8180
2. Clients → datum-travels-frontend
3. Agregar nueva IP en Valid Redirect URIs y Web Origins
4. Save

---

### ❌ "CORS error"

**Causa:** Olvidaste actualizar `application.properties`

**Solución:**
```properties
quarkus.http.cors.origins=http://localhost:5173,http://192.168.0.105:5173
```
Reiniciar backend.

---

### ❌ "La WiFi del lugar no permite conexiones entre dispositivos"

**Algunas redes públicas (universidades, empresas) bloquean esto.**

**Plan B:**
1. Crear Hotspot WiFi desde tu laptop:
   - Configuración → Red e Internet → Hotspot móvil
   - Activar
   - Conectar celular al hotspot

2. Obtener nueva IP del hotspot:
   ```powershell
   ipconfig | findstr "192.168"
   # Generalmente será 192.168.137.1
   ```

3. Repetir pasos de configuración con la nueva IP

---

## 📝 CHECKLIST RÁPIDO DÍA DE PRESENTACIÓN

**15 minutos antes de empezar:**

- [ ] Conectado a WiFi del lugar
- [ ] Nueva IP detectada: `____________`
- [ ] Frontend .env actualizado
- [ ] Backend application.properties actualizado
- [ ] Firewall configurado
- [ ] Docker corriendo
- [ ] Keycloak configurado con nueva IP
- [ ] Backend iniciado (http://0.0.0.0:8081)
- [ ] Frontend iniciado (Network: http://192.168.X.X:5173)
- [ ] Celular conectado a misma WiFi
- [ ] Login probado desde celular
- [ ] Usuario de prueba funcionando

---

## 🎯 TIEMPO TOTAL ESTIMADO

| Actividad | Tiempo |
|-----------|--------|
| Conectar WiFi y detectar IP | 1 min |
| Actualizar archivos (.env + properties) | 3 min |
| Configurar Firewall | 1 min |
| Iniciar Docker | 2 min |
| Configurar Keycloak | 2 min |
| Iniciar Backend + Frontend | 3 min |
| Probar desde celular | 1 min |
| **TOTAL** | **~13 minutos** |

**Recomendación:** Llegar 20 minutos antes de la presentación.

---

## 💾 DESPUÉS DE LA PRESENTACIÓN

```powershell
# Opcional: Limpiar reglas de firewall
Get-NetFirewallRule -DisplayName "Datum Travels*" | Remove-NetFirewallRule

# Detener servicios Docker
docker-compose -f docker-compose-dev.yml down
```

---

## 📱 CONTACTOS DE EMERGENCIA

**Si algo falla durante la presentación:**

1. Tener esta guía a mano (impresa o en celular)
2. Tener backup de credenciales
3. Plan B: Demostrar solo en laptop (sin celular)

---

**¡Buena suerte en tu presentación! 🍀**
