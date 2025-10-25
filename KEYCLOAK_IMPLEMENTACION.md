# 🔐 Integración de Keycloak - Datum Travels

## ✅ ¿Qué se ha implementado?

### 1. **Estructura de archivos creada**

```
BackEnd/
├── keycloak/                           ← Nueva carpeta
│   ├── README.md                       ← Documentación completa de Keycloak
│   ├── GUIA_CONFIGURACION.md          ← Guía paso a paso interactiva
│   ├── docker-compose.yml             ← Docker Compose standalone (opcional)
│   ├── .env.example                   ← Plantilla de variables de entorno
│   └── realm-config/                  ← Carpeta para exportar configuración
│       └── (vacía, para futuro)
```

### 2. **Docker Compose actualizado**

**Archivo:** `docker-compose-dev.yml`

Se agregó el servicio de Keycloak:

```yaml
datum-keycloak:
  image: quay.io/keycloak/keycloak:23.0.7
  container_name: datum-keycloak-dev
  ports:
    - "8180:8080"
  environment:
    KEYCLOAK_ADMIN: admin
    KEYCLOAK_ADMIN_PASSWORD: admin123
    KC_DB: dev-file
    KC_HTTP_ENABLED: "true"
```

**Puertos:**
- Oracle: `1522` (ya existía)
- **Keycloak: `8180`** ← Nuevo
- Quarkus: `8080` (host)

### 3. **application.properties actualizado**

**Archivo:** `BackEnd/quarkus-api/src/main/resources/application.properties`

Se actualizó la configuración de Keycloak con instrucciones claras:

```properties
# ⚠️ CAMBIAR A TRUE cuando Keycloak esté configurado
quarkus.oidc.enabled=false

keycloak.server-url=http://localhost:8180
keycloak.realm=datum-travels
keycloak.client-id=datum-travels-backend
keycloak.client-secret=your-client-secret-here
```

### 4. **Script de arranque automático**

**Archivo:** `start-keycloak.ps1`

Script inteligente que:
- ✅ Verifica Docker
- ✅ Levanta Oracle (si no está corriendo)
- ✅ Levanta Keycloak
- ✅ Espera a que estén saludables
- ✅ Muestra el estado final
- ✅ Indica los próximos pasos

---

## 🚀 Cómo Usar

### **Paso 1: Levantar la infraestructura**

```powershell
# Desde la raíz del proyecto
.\start-keycloak.ps1
```

O manualmente:

```powershell
docker-compose -f docker-compose-dev.yml up -d
```

### **Paso 2: Verificar que todo está corriendo**

```powershell
docker ps
```

Deberías ver:
- `datum-oracle-dev` (healthy)
- `datum-keycloak-dev` (healthy)

### **Paso 3: Configurar Keycloak**

Sigue la **guía paso a paso**:

```powershell
# Abrir la guía
code BackEnd/keycloak/GUIA_CONFIGURACION.md
```

O consulta el README:

```powershell
code BackEnd/keycloak/README.md
```

**Resumen rápido:**

1. Abre <http://localhost:8180>
2. Login: `admin / admin123`
3. Crea Realm: `datum-travels`
4. Crea Client: `datum-travels-backend`
5. Copia el Client Secret
6. Actualiza `application.properties`
7. Crea usuario de prueba
8. Cambia `quarkus.oidc.enabled=true`

### **Paso 4: Probar autenticación**

```powershell
# Probar con Keycloak directo
curl -X POST http://localhost:8180/realms/datum-travels/protocol/openid-connect/token `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "grant_type=password" `
  -d "client_id=datum-travels-backend" `
  -d "client_secret=TU_CLIENT_SECRET" `
  -d "username=carlos.test" `
  -d "password=test123"
```

---

## 📐 Arquitectura Implementada

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Compose                         │
│  ┌──────────────────┐          ┌──────────────────┐        │
│  │  Oracle XE 21c   │          │  Keycloak 23.0.7 │        │
│  │  Port: 1522      │          │  Port: 8180      │        │
│  └──────────────────┘          └──────────────────┘        │
│          ▲                              ▲                   │
│          │ datum-network                │                   │
└──────────┼──────────────────────────────┼───────────────────┘
           │                              │
           │                              │
      ┌────┴──────────────────────────────┴────┐
      │         Quarkus (Host)                 │
      │         Port: 8080                     │
      │         mvn quarkus:dev                │
      └────────────────────────────────────────┘
```

**Ventajas de esta arquitectura:**
- ✅ Hot reload de Quarkus funciona normalmente
- ✅ No necesitas reconstruir imagen Docker en cada cambio
- ✅ Keycloak está aislado en Docker
- ✅ Oracle está aislado en Docker
- ✅ Ideal para desarrollo activo

---

## 🗂️ Documentación Disponible

### 1. **README.md** (BackEnd/keycloak/)
Documentación completa de Keycloak:
- ¿Qué es Keycloak?
- Inicio rápido
- Configuración del Realm
- Creación de Client
- Pruebas de autenticación
- Comandos útiles
- Troubleshooting

### 2. **GUIA_CONFIGURACION.md** (BackEnd/keycloak/)
Guía paso a paso interactiva:
- Checklist de configuración
- Capturas conceptuales
- Instrucciones detalladas
- Validación en cada paso
- Ejemplos de curl/PowerShell

### 3. **.env.example** (BackEnd/keycloak/)
Plantilla de variables de entorno:
- Client Secret
- Credenciales de admin
- Instrucciones de uso

### 4. **docker-compose.yml** (BackEnd/keycloak/)
Docker Compose standalone:
- Solo Keycloak
- Para pruebas aisladas

---

## 🔄 Flujo de Trabajo Completo

### **Desarrollo Diario**

1. **Primera vez:**
   ```powershell
   .\start-keycloak.ps1
   # Configurar Keycloak (solo una vez)
   ```

2. **Días siguientes:**
   ```powershell
   # Levantar infraestructura
   docker-compose -f docker-compose-dev.yml up -d
   
   # Iniciar backend
   cd BackEnd/quarkus-api
   mvn quarkus:dev
   
   # Iniciar frontend (en otra terminal)
   cd FrontEnd/frontend
   npm run dev
   ```

3. **Al terminar:**
   ```powershell
   # Detener contenedores (mantiene datos)
   docker-compose -f docker-compose-dev.yml stop
   
   # O eliminar contenedores (mantiene datos)
   docker-compose -f docker-compose-dev.yml down
   ```

---

## ⚙️ Configuración Pendiente

### **Para que Keycloak funcione completamente:**

- [ ] Ejecutar `start-keycloak.ps1`
- [ ] Acceder a <http://localhost:8180>
- [ ] Crear Realm `datum-travels`
- [ ] Crear Client `datum-travels-backend`
- [ ] Copiar Client Secret
- [ ] Actualizar `application.properties` con el secret real
- [ ] Cambiar `quarkus.oidc.enabled=true`
- [ ] Crear usuario de prueba
- [ ] Probar autenticación

**Tiempo estimado:** 10-15 minutos siguiendo la guía.

---

## 🎯 Próximos Pasos

### **Inmediato:**

1. **Levantar Keycloak:**
   ```powershell
   .\start-keycloak.ps1
   ```

2. **Configurar Keycloak:**
   Sigue `BackEnd/keycloak/GUIA_CONFIGURACION.md`

3. **Probar integración:**
   ```powershell
   # Login con Keycloak
   curl -X POST http://localhost:8080/api/auth/login ...
   ```

### **Futuro (opcional):**

- [ ] Implementar roles en Keycloak (admin, user, contador)
- [ ] Crear Client para Frontend React
- [ ] Importar usuarios desde Oracle
- [ ] Configurar Social Login (Google, Microsoft)
- [ ] Exportar configuración del Realm
- [ ] Setup para Producción (PostgreSQL, HTTPS)

---

## 🐛 Troubleshooting

### **Keycloak no arranca**

```powershell
# Ver logs
docker logs -f datum-keycloak-dev

# Reiniciar
docker restart datum-keycloak-dev
```

### **No puedo acceder a localhost:8180**

```powershell
# Verificar que está corriendo
docker ps | Select-String keycloak

# Verificar salud
docker inspect --format='{{.State.Health.Status}}' datum-keycloak-dev
```

### **Error "Invalid client credentials"**

- Verifica que el `client-secret` sea correcto
- Verifica que "Client authentication" esté en **ON**
- Verifica que "Direct access grants" esté en **ON**

---

## 📚 Referencias

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Quarkus OIDC Guide](https://quarkus.io/guides/security-oidc-bearer-token-authentication)
- Documentación local: `BackEnd/keycloak/README.md`

---

## ✨ ¡Listo para Empezar!

Ejecuta el script de arranque y sigue la guía paso a paso:

```powershell
.\start-keycloak.ps1
```

Luego abre:
```
BackEnd/keycloak/GUIA_CONFIGURACION.md
```

**¡Todo está documentado y listo para usar!** 🎉
