# 🔧 SOLUCIÓN - Error de CORS en Login

## 🚨 Problema Detectado

```
Error: Access to fetch at 'http://localhost:8180/realms/datum-travels/protocol/openid-connect/token' 
from origin 'http://localhost:5174' has been blocked by CORS policy
```

**Causa:** El frontend cambió del puerto `5173` al `5174`, y Keycloak no tiene permitido ese origen.

---

## ✅ Soluciones Implementadas

### **Solución 1: Forzar Puerto 5173 (RECOMENDADA)**

He actualizado `vite.config.ts` para forzar el puerto 5173:

```typescript
server: {
  port: 5173,
  strictPort: true, // ← NUEVO: Falla si el puerto está ocupado
}
```

#### **Cómo aplicar:**

1. **Detener el frontend actual** (Ctrl+C en la terminal)

2. **Verificar que no haya otra instancia corriendo:**
   ```powershell
   # En PowerShell
   Get-Process | Where-Object {$_.ProcessName -like "*node*"}
   ```

3. **Ejecutar script de limpieza automática:**
   ```powershell
   cd FrontEnd\frontend
   .\iniciar-frontend.ps1
   ```

4. **O manualmente:**
   ```powershell
   cd FrontEnd\frontend
   npm run dev
   ```

**Resultado esperado:**
```
  VITE v7.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/  ← Debe ser 5173
  ➜  Network: use --host to expose
```

---

### **Solución 2: Actualizar Keycloak para Permitir Puerto 5174**

Si necesitas usar el puerto 5174, debes configurar Keycloak:

#### **Opción A: Desde Keycloak Admin Console (UI)**

1. **Acceder a Keycloak Admin:**
   ```
   http://localhost:8180/admin
   Usuario: admin
   Password: admin
   ```

2. **Navegar a:**
   ```
   Realm: datum-travels
   → Clients
   → datum-travels-frontend
   → Settings
   ```

3. **Agregar en "Valid redirect URIs":**
   ```
   http://localhost:5173/*
   http://localhost:5174/*  ← AGREGAR ESTA LÍNEA
   ```

4. **Agregar en "Web origins":**
   ```
   http://localhost:5173
   http://localhost:5174  ← AGREGAR ESTA LÍNEA
   +
   ```

5. **Click en "Save"**

#### **Opción B: Script SQL (Más Rápido)**

Crear archivo `keycloak/update-cors.sql`:
```sql
-- Actualizar client para permitir ambos puertos
UPDATE CLIENT 
SET WEB_ORIGINS = '+,http://localhost:5173,http://localhost:5174'
WHERE CLIENT_ID = 'datum-travels-frontend';
```

Ejecutar en la BD de Keycloak.

---

### **Solución 3: Matar Proceso en Puerto 5173 (Windows)**

Si el puerto 5173 está ocupado:

```powershell
# Ver qué proceso usa el puerto 5173
netstat -ano | findstr :5173

# Anotar el PID (última columna)
# Ejemplo: PID = 12345

# Matar el proceso
taskkill /PID 12345 /F
```

**O usar el script automático:**
```powershell
.\iniciar-frontend.ps1
```

---

## 🎯 Pasos Recomendados (EN ORDEN)

### **1️⃣ Detener Frontend Actual**
En la terminal donde corre el frontend:
```
Ctrl + C
```

### **2️⃣ Verificar Puerto Libre**
```powershell
netstat -ano | findstr :5173
```

Si sale algo, ejecutar:
```powershell
# Anotar el PID de la última columna
taskkill /PID <PID> /F
```

### **3️⃣ Reiniciar Frontend**
```powershell
cd FrontEnd\frontend
npm run dev
```

### **4️⃣ Verificar Puerto Correcto**
Debe mostrar:
```
➜  Local:   http://localhost:5173/
```

### **5️⃣ Probar Login**
Ir a `http://localhost:5173` e intentar login.

---

## 🔍 Verificación Post-Solución

### **Checklist:**
- [ ] Frontend corre en puerto **5173** (no 5174)
- [ ] Al hacer login, la consola NO muestra errores de CORS
- [ ] El token se obtiene correctamente
- [ ] La redirección a `/home` funciona

### **Si persiste el error:**

1. **Limpiar caché del navegador:**
   ```
   Ctrl + Shift + Delete
   → Limpiar cookies y datos de sitio
   ```

2. **Reiniciar Keycloak:**
   ```powershell
   docker restart keycloak
   # O
   docker-compose restart keycloak
   ```

3. **Verificar logs de Keycloak:**
   ```powershell
   docker logs keycloak
   ```

---

## 📝 Archivos Modificados

1. ✅ `vite.config.ts` - Agregado `strictPort: true`
2. ✅ `iniciar-frontend.ps1` - Script para limpiar puerto y reiniciar

---

## 🐛 Debugging Avanzado

Si el problema continúa, verificar:

### **1. Variable de entorno:**
```bash
# En FrontEnd/frontend/.env
VITE_KEYCLOAK_URL=http://localhost:8180
```

### **2. Network tab en DevTools:**
- Abrir DevTools (F12)
- Tab "Network"
- Filtrar por "token"
- Ver qué URL se está llamando
- Verificar Response Headers

### **3. Keycloak Client Settings:**
```
Realm: datum-travels
Client: datum-travels-frontend
→ Valid redirect URIs: http://localhost:5173/*
→ Web origins: http://localhost:5173
→ Access Type: public
```

---

## 🚀 Ejecutar Ahora

```powershell
# Terminal 1 - Keycloak (si no está corriendo)
docker-compose up -d keycloak

# Terminal 2 - Backend
cd BackEnd\quarkus-api
.\mvnw quarkus:dev

# Terminal 3 - Frontend (CON LIMPIEZA)
cd FrontEnd\frontend
.\iniciar-frontend.ps1
```

**¡Listo! El login debería funcionar ahora. 🎉**
