# ⚡ Quick Setup - Keycloak Configuración Compartida

## 🎯 Para Desarrolladores Nuevos

### Si es la PRIMERA VEZ que levantas Keycloak:

```powershell
# 1. Pull de la rama de Carlos
git pull origin carlos

# 2. Levantar Docker
docker-compose -f docker-compose-dev.yml up -d

# 3. Esperar 90 segundos y verificar
# http://localhost:8180 (admin / admin2025)
```

**✅ ¡Listo!** El realm `datum-travels` ya está configurado automáticamente.

---

### Si YA tenías Keycloak corriendo antes:

```powershell
# 1. Pull
git pull origin carlos

# 2. Borrar datos viejos y reiniciar
docker-compose -f docker-compose-dev.yml down -v
docker-compose -f docker-compose-dev.yml up -d

# 3. Esperar 90 segundos
```

**✅ Listo.** Ahora tienes la misma configuración que Carlos.

---

## 🔍 Verificar que Funcionó

1. http://localhost:8180
2. Login: `admin` / `admin2025`
3. Cambiar al realm **`datum-travels`** (dropdown arriba izquierda)
4. Verificar que existen:
   - ✅ Roles: `admin`, `usuario`
   - ✅ Client: `datum-travels-frontend`
   - ✅ Usuarios de prueba (si Carlos los exportó)

---

## 🆘 Problemas

### No veo el realm `datum-travels`

```powershell
# Empezar limpio
docker-compose -f docker-compose-dev.yml down -v
docker-compose -f docker-compose-dev.yml up -d
```

### Error "Realm already exists"

```powershell
# Borrar el realm viejo desde la UI:
# http://localhost:8180 → datum-travels → Realm settings → Delete
# Luego:
docker-compose -f docker-compose-dev.yml restart datum-keycloak
```

---

📖 **Guía completa:** `keycloak/GUIA_DEVS_NUEVOS.md`
