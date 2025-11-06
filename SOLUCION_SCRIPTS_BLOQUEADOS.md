# 🔓 SOLUCIÓN: Scripts Bloqueados en PowerShell

## ⚠️ Error que obtuviste:
```
cannot be loaded because running scripts is disabled on this system
```

---

## ✅ SOLUCIONES (Elige una)

### 🎯 OPCIÓN 1: Habilitar Scripts SOLO para esta sesión (RECOMENDADA)

**Paso a paso:**

1. **Cierra PowerShell actual**

2. **Abre PowerShell como ADMINISTRADOR:**
   - Click derecho en el botón de Windows
   - "Terminal (Administrador)" o "PowerShell (Administrador)"
   - Click en "Sí" en el UAC

3. **Ejecuta este comando UNA SOLA VEZ:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
   
4. **Confirma con "S" (Sí)**

5. **Ahora SÍ puedes ejecutar scripts:**
   ```powershell
   cd "C:\Users\ialva\Desktop\UDB CICLOS\TRABAJO DOCUMENTOS\DATUM REDSOFT\Proyecto Final"
   .\configurar-firewall.ps1
   ```

**Esto es seguro porque:**
- ✅ Solo permite scripts que TÚ crees (locales)
- ✅ Bloquea scripts descargados de internet (a menos que estén firmados)
- ✅ Es la configuración recomendada por Microsoft

---

### 🎯 OPCIÓN 2: Habilitar solo para UNA sesión temporal

Si no quieres cambiar la política permanentemente:

1. **Abre PowerShell como ADMINISTRADOR**

2. **Ejecuta:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
   ```

3. **Ejecuta tu script:**
   ```powershell
   cd "C:\Users\ialva\Desktop\UDB CICLOS\TRABAJO DOCUMENTOS\DATUM REDSOFT\Proyecto Final"
   .\configurar-firewall.ps1
   ```

4. **Al cerrar PowerShell, vuelve a la configuración anterior** ✅

---

### 🎯 OPCIÓN 3: Ejecutar sin cambiar política (Bypass temporal)

```powershell
# Abre PowerShell como ADMINISTRADOR y ejecuta:
powershell -ExecutionPolicy Bypass -File ".\configurar-firewall.ps1"
```

---

### 🎯 OPCIÓN 4: Configurar Firewall MANUALMENTE (Sin scripts)

Si prefieres no usar scripts, ejecuta estos comandos UNO POR UNO en PowerShell como ADMINISTRADOR:

```powershell
# Puerto 5173 - Frontend Vite
New-NetFirewallRule -DisplayName "Datum Travels - Vite" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow -Profile Private,Domain

# Puerto 8081 - Backend Quarkus
New-NetFirewallRule -DisplayName "Datum Travels - Backend" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow -Profile Private,Domain

# Puerto 8180 - Keycloak
New-NetFirewallRule -DisplayName "Datum Travels - Keycloak" -Direction Inbound -LocalPort 8180 -Protocol TCP -Action Allow -Profile Private,Domain

# Puerto 8080 - OCR Microservice
New-NetFirewallRule -DisplayName "Datum Travels - OCR" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow -Profile Private,Domain
```

**Verificar que se crearon:**
```powershell
Get-NetFirewallRule -DisplayName "Datum*"
```

---

## 🔍 Verificar política actual

Para ver qué política tienes actualmente:

```powershell
Get-ExecutionPolicy -List
```

**Resultado típico:**
```
Scope          ExecutionPolicy
-----          ---------------
MachinePolicy  Undefined
UserPolicy     Undefined
Process        Undefined
CurrentUser    Restricted    ← Esto es lo que te bloquea
LocalMachine   Undefined
```

---

## 📋 COMPARACIÓN DE POLÍTICAS

| Política | Permite scripts locales | Permite scripts descargados | Seguridad | Recomendado |
|----------|-------------------------|----------------------------|-----------|-------------|
| **Restricted** | ❌ No | ❌ No | 🔒🔒🔒 Máxima | Solo lectura |
| **AllSigned** | ⚠️ Si están firmados | ⚠️ Si están firmados | 🔒🔒 Alta | Empresas |
| **RemoteSigned** | ✅ Sí | ⚠️ Solo firmados | 🔒 Media | ⭐ **IDEAL** |
| **Unrestricted** | ✅ Sí | ✅ Sí (con advertencia) | ⚠️ Baja | Desarrollo |
| **Bypass** | ✅ Sí | ✅ Sí (sin advertencia) | 🚨 Ninguna | Temporal |

**Nuestra recomendación:** `RemoteSigned` (Opción 1)

---

## ✅ DESPUÉS DE CONFIGURAR

Una vez que hayas habilitado los scripts (Opción 1, 2 o 3):

1. **Configura el Firewall:**
   ```powershell
   .\configurar-firewall.ps1
   ```

2. **Cambia IP cuando cambies de WiFi:**
   ```powershell
   .\cambiar-ip.ps1
   ```

3. **Inicia el stack completo:**
   ```powershell
   .\iniciar-stack-lan.ps1
   ```

---

## 🆘 SI AÚN NO FUNCIONA

### Problema: "No puedo abrir PowerShell como Administrador"

**Solución alternativa - Interfaz gráfica:**

1. **Abrir Firewall de Windows manualmente:**
   - Windows + R → `wf.msc` → Enter
   - Click en "Reglas de entrada" (Inbound Rules)
   - Click derecho → "Nueva regla..."
   
2. **Crear regla para cada puerto:**
   - Tipo: Puerto
   - Protocolo: TCP
   - Puerto: 5173 (luego repetir con 8081, 8180, 8080)
   - Acción: Permitir conexión
   - Perfil: Privado, Dominio
   - Nombre: "Datum Travels - Vite" (cambiar según puerto)

---

## 💡 RESUMEN RÁPIDO

**Si eres desarrollador y vas a usar scripts frecuentemente:**
→ Usa **Opción 1** (RemoteSigned permanente)

**Si solo quieres probar hoy:**
→ Usa **Opción 2** (Bypass temporal)

**Si no quieres tocar políticas:**
→ Usa **Opción 4** (Comandos manuales)

**Si tienes restricciones de empresa:**
→ Usa interfaz gráfica del Firewall (wf.msc)

---

## 📞 PRÓXIMO PASO

Después de configurar el Firewall (con cualquier método), continúa con:

1. ✅ Firewall configurado (acabas de hacer esto)
2. ⏭️ Configurar Keycloak (ver INICIO_RAPIDO_PWA.md)
3. ⏭️ Levantar servicios (ejecutar iniciar-stack-lan.ps1)
