# ❓ FAQ - Preguntas Frecuentes PWA Red Local

## 🌐 Sobre la Red Local

### ❓ ¿Puedo usar la app desde cualquier WiFi?
**No.** Solo funciona cuando tu celular y tu PC están conectados a la **misma red WiFi**. Si cambias de WiFi o usas datos móviles, no funcionará.

### ❓ ¿Necesito internet para usar la app?
**No necesariamente.** Una vez conectado a la WiFi local:
- ✅ La app funciona **sin internet externo**
- ✅ Todos los datos están en tu red local
- ⚠️ OCR con Azure **SÍ necesita internet** (si lo usas)

### ❓ ¿Qué pasa si cambio de WiFi?
Tu IP local puede cambiar. Debes:
1. Obtener la nueva IP: `ipconfig | findstr "IPv4"`
2. Actualizar `.env` del frontend
3. Actualizar `application.properties` del backend
4. Actualizar Keycloak (Web Origins + Redirect URIs)
5. Reiniciar servicios

---

## 📱 Sobre el Celular

### ❓ ¿Funciona en iPhone y Android?
**Sí.** La PWA funciona en ambos:
- ✅ Android (Chrome, Edge, Samsung Internet)
- ✅ iOS (Safari 11.3+)

### ❓ ¿Puedo usar múltiples celulares?
**Sí.** Cualquier dispositivo en la misma WiFi puede acceder:
- Celulares Android
- Celulares iOS
- Tablets
- Otras PCs/Laptops

### ❓ ¿La PWA funciona offline?
**Parcialmente.** Gracias a Service Workers:
- ✅ La interfaz se guarda en caché
- ✅ Imágenes y estilos funcionan offline
- ❌ Datos nuevos requieren conexión a tu PC
- ⚠️ Si la PC está apagada, no habrá backend

---

## 🔒 Sobre Seguridad

### ❓ ¿Es seguro usar HTTP sin SSL?
**En red local SÍ.** 
- ✅ Los datos **no salen** de tu red local
- ✅ Nadie de internet puede acceder
- ⚠️ Para producción 24/7 se recomienda HTTPS (Estrategia 3)

### ❓ ¿Otros en mi WiFi pueden acceder?
**Sí.** Cualquiera en la misma WiFi puede acceder si conoce la URL:
- `http://192.168.1.6:5173`

**Para restringir:**
- Usa una WiFi privada (no pública)
- Configura el Firewall solo para IPs específicas
- Usa autenticación fuerte en Keycloak

### ❓ ¿Mis datos están seguros?
**En red local SÍ:**
- ✅ Base de datos Oracle en tu PC (no en la nube)
- ✅ Archivos OCR en tu PC
- ✅ Tokens JWT solo viajan en red local
- ⚠️ Asegúrate de que tu WiFi tenga contraseña fuerte

---

## 💻 Sobre la PC Servidor

### ❓ ¿Puedo apagar la PC?
**No.** Tu PC actúa como servidor. Si la apagas:
- ❌ Backend se detiene
- ❌ Base de datos no está disponible
- ❌ La app en el celular no podrá cargar datos

### ❓ ¿Puedo usar una laptop en lugar de PC?
**Sí.** Funciona igual:
- Laptop → Servidor
- Celular → Cliente

**Importante:**
- La laptop debe permanecer encendida
- No debe entrar en suspensión
- Debe estar conectada a la corriente (recomendado)

### ❓ ¿Puedo poner la PC en suspensión?
**No.** En suspensión:
- ❌ Los servicios se pausan
- ❌ El celular pierde conexión
- ✅ Puedes minimizar las ventanas (sin problema)

**Configurar para evitar suspensión:**
1. Configuración → Sistema → Energía
2. "Suspender el equipo" → **Nunca** (cuando esté enchufado)

---

## 🐳 Sobre Docker

### ❓ ¿Necesito Docker Desktop siempre corriendo?
**Sí.** Docker Desktop debe estar activo para que funcionen:
- Oracle Database
- Keycloak
- OpenKM

### ❓ ¿Cuánto espacio ocupa Docker?
Aproximadamente:
- Oracle XE: ~3-4 GB
- Keycloak: ~500 MB
- OpenKM: ~1-2 GB
- **Total:** ~5-7 GB

### ❓ ¿Los contenedores se reinician solos?
**Sí.** Están configurados con `restart: unless-stopped`:
- ✅ Se inician automáticamente al abrir Docker Desktop
- ✅ Se reinician si hay un error
- ❌ No se inician si Docker Desktop está cerrado

---

## ⚡ Sobre Rendimiento

### ❓ ¿Es rápida la app en el celular?
**Muy rápida.** Al estar en red local:
- ⚡ Latencia: <10ms (vs 100-300ms en internet)
- ⚡ No depende de velocidad de internet
- ⚡ Solo depende de tu router WiFi

### ❓ ¿Puedo usar mientras otros usan la PC?
**Sí.** La app corre en background:
- ✅ Puedes usar otras apps en la PC
- ✅ Consumo mínimo de recursos
- ⚠️ No cierres las terminales de Quarkus

### ❓ ¿Cuántos usuarios simultáneos soporta?
En red local:
- ✅ 5-10 usuarios: Sin problemas
- ⚠️ 20+ usuarios: Puede haber lentitud
- 💡 Para más usuarios → VPS (Estrategia 3)

---

## 🔄 Sobre Actualizaciones

### ❓ ¿Cómo actualizo el código?
1. Haz tus cambios en el código
2. El backend se recarga automáticamente (Quarkus Live Reload)
3. El frontend se recarga automáticamente (Vite HMR)
4. Recarga la página en el celular

### ❓ ¿El celular ve los cambios al instante?
**Sí**, gracias a:
- ✅ Hot Module Replacement (HMR) de Vite
- ✅ Live Reload de Quarkus
- ⚠️ A veces necesitas recargar manualmente en el celular

### ❓ ¿Puedo actualizar sin parar los servicios?
**Depende:**
- ✅ Frontend: No hace falta parar nada (HMR)
- ✅ Backend: No hace falta parar nada (Live Reload)
- ❌ Docker: Sí hay que reiniciar contenedores
- ❌ Keycloak config: No afecta servicios corriendo

---

## 🚫 Limitaciones

### ❓ ¿Puedo acceder desde fuera de mi casa?
**No** con esta configuración. Solo funciona en red local.

**Para acceso desde cualquier lugar:**
- 🌐 Estrategia 2 (ngrok): Túnel temporal
- ☁️ Estrategia 3 (VPS): Solución permanente

### ❓ ¿Funciona con datos móviles (4G/5G)?
**No.** Necesitas WiFi. Los datos móviles no pueden acceder a tu PC local.

**Alternativa:**
- 📡 Crear hotspot WiFi desde la PC
- 📱 Conectar celular al hotspot
- ⚠️ IP será diferente (192.168.137.x generalmente)

### ❓ ¿Puedo compartir la URL con alguien en otra ciudad?
**No.** La IP `192.168.1.6` es privada de tu red local.

**Para compartir con externos:**
- Usa Estrategia 2 (ngrok) para demos temporales
- Usa Estrategia 3 (VPS) para acceso permanente

---

## 🛠️ Mantenimiento

### ❓ ¿Qué pasa si reinicio la PC?
Al reiniciar:
1. Docker Desktop debe iniciarse (si está en autostart)
2. Los contenedores se inician automáticamente
3. Debes volver a ejecutar:
   - Backend: `.\mvnw quarkus:dev`
   - Frontend: `.\iniciar-lan.ps1`

### ❓ ¿Cómo hago backup?
**Base de datos:**
```powershell
docker exec -it datum-oracle-dev bash
expdp datum_user/datum2025@XEPDB1 directory=DATA_PUMP_DIR dumpfile=backup.dmp
```

**Código:**
- Usa Git (commit + push)
- Tu código ya está versionado en GitHub

**Volúmenes Docker:**
- Se guardan en: `%USERPROFILE%\.docker\volumes`
- O configurados en `docker-compose-dev.yml`

### ❓ ¿Cómo limpio/reseteo todo?
```powershell
# Detener servicios
docker-compose -f docker-compose-dev.yml down

# Eliminar volúmenes (⚠️ BORRA DATOS)
docker-compose -f docker-compose-dev.yml down -v

# Reiniciar
docker-compose -f docker-compose-dev.yml up -d
```

---

## 🎯 Próximos Pasos

### ❓ ¿Cuándo debería migrar a VPS?
Migra a Estrategia 3 (VPS) cuando:
- ✅ Quieras acceso 24/7
- ✅ Quieras acceso desde cualquier WiFi
- ✅ Tengas múltiples usuarios (10+)
- ✅ Quieras un dominio personalizado (app.tuempresa.com)
- ✅ Necesites HTTPS/SSL
- ✅ La app esté en producción

**Costo estimado:** $5-12 USD/mes

### ❓ ¿Cómo migro a VPS?
Cuando estés listo, podemos configurar:
1. VPS en DigitalOcean/Vultr/Linode
2. Nginx como reverse proxy
3. Docker Compose en el VPS
4. Certificado SSL gratis (Let's Encrypt)
5. Dominio personalizado

---

**¿Más preguntas?** Consulta `GUIA_PWA_LAN.md` o `CHECKLIST_PWA_LAN.md`
