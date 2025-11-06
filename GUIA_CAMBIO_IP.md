# 🔄 GUÍA RÁPIDA: Cambio de IP/WiFi

## ⚠️ Cuándo usar esta guía
- Cambiaste de WiFi (casa → oficina → universidad)
- Tu IP local cambió
- Keycloak da error: "Invalid redirect_uri"

---

## 📝 PASOS CUANDO CAMBIAS DE WIFI

### 1️⃣ Obtener la nueva IP
```powershell
ipconfig | findstr "IPv4" | findstr "192.168"
```

**Ejemplo de salida:**
```
IPv4 Address. . . . . . . . . . . : 192.168.1.6     ← Tu casa
IPv4 Address. . . . . . . . . . . : 192.168.0.105   ← Oficina
IPv4 Address. . . . . . . . . . . : 192.168.43.200  ← Universidad
```

Anota la IP que comienza con `192.168.x.x`

---

### 2️⃣ Actualizar Frontend (.env)

**Archivo:** `FrontEnd/frontend/.env`

**Cambiar de:**
```bash
VITE_KEYCLOAK_HOST=192.168.1.6        # IP antigua
VITE_KEYCLOAK_URL=http://192.168.1.6:8180
VITE_API_BASE_URL=http://192.168.1.6:8081/api
```

**A:**
```bash
VITE_KEYCLOAK_HOST=192.168.X.X        # Nueva IP
VITE_KEYCLOAK_URL=http://192.168.X.X:8180
VITE_API_BASE_URL=http://192.168.X.X:8081/api
```

---

### 3️⃣ Actualizar Backend (application.properties)

**Archivo:** `BackEnd/quarkus-api/src/main/resources/application.properties`

**Cambiar de:**
```properties
quarkus.http.cors.origins=http://localhost:5173,http://192.168.1.6:5173
```

**A:**
```properties
quarkus.http.cors.origins=http://localhost:5173,http://192.168.X.X:5173
```

**💡 TIP:** Puedes dejar ambas IPs separadas por comas si usas múltiples WiFi:
```properties
quarkus.http.cors.origins=http://localhost:5173,http://192.168.1.6:5173,http://192.168.0.105:5173
```

---

### 4️⃣ Actualizar Keycloak

**Paso a paso:**

1. Abre: http://localhost:8180
2. Login: `admin` / `admin2025`
3. Clients → `datum-travels-frontend` → Settings
4. Busca: **Valid Redirect URIs**
5. **AGREGAR** la nueva IP (no borres la antigua si quieres usarla):
   ```
   http://192.168.X.X:5173/*
   ```
6. Busca: **Web Origins**
7. **AGREGAR** la nueva IP:
   ```
   http://192.168.X.X:5173
   ```
8. Click **Save**

**Resultado final en Keycloak:**
```
Valid Redirect URIs:
  http://localhost:5173/*
  http://192.168.1.6:5173/*     ← Casa
  http://192.168.0.105:5173/*   ← Oficina
  http://192.168.X.X:5173/*     ← Nueva red

Web Origins:
  http://localhost:5173
  http://192.168.1.6:5173       ← Casa
  http://192.168.0.105:5173     ← Oficina
  http://192.168.X.X:5173       ← Nueva red
```

---

### 5️⃣ Reiniciar Servicios

```powershell
# 1. Reiniciar Backend (Ctrl+C en la terminal y luego):
cd BackEnd\quarkus-api
.\mvnw quarkus:dev

# 2. Reiniciar Frontend (Ctrl+C en la terminal y luego):
cd FrontEnd\frontend
.\iniciar-lan.ps1
```

**Docker y Keycloak NO necesitan reiniciarse** (ya están corriendo)

---

### 6️⃣ Probar desde el Celular

```
http://192.168.X.X:5173
```

---

## ⚡ SCRIPT AUTOMÁTICO (PRÓXIMAMENTE)

**Te puedo crear un script que:**
1. Detecte automáticamente la IP
2. Actualice todos los archivos
3. Te muestre qué agregar en Keycloak

¿Quieres que lo cree? 🤔

---

## 💡 TIPS PARA MÚLTIPLES REDES

### Opción 1: Mantener todas las IPs configuradas
- ✅ No necesitas reconfigurar cada vez
- ✅ Funciona en casa, oficina, universidad
- ⚠️ Lista larga en Keycloak

### Opción 2: IP Estática en tu Router
Si siempre usas la misma WiFi:
1. Entra a tu router (ej: 192.168.1.1)
2. Reserva una IP fija para tu PC (ej: siempre 192.168.1.6)
3. ✅ Nunca cambiará la IP en esa red

### Opción 3: Usar Wildcard (No recomendado para producción)
```
Valid Redirect URIs: http://*:5173/*
Web Origins: *
```
⚠️ Menos seguro, pero funciona en cualquier IP

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### ❌ "Invalid redirect_uri" en el celular
→ Falta agregar la nueva IP en Keycloak (Paso 4)

### ❌ "CORS error" en consola del navegador
→ Falta actualizar `application.properties` (Paso 3)

### ❌ La app no carga en el celular
→ Verifica que la IP sea correcta (Paso 1)

---

**¿Necesitas ayuda?** Ejecuta estos comandos para verificar:

```powershell
# Ver tu IP actual
ipconfig | findstr "IPv4"

# Ver configuración de CORS
Get-Content BackEnd\quarkus-api\src\main\resources\application.properties | Select-String "cors.origins"

# Ver configuración de Frontend
Get-Content FrontEnd\frontend\.env
```
