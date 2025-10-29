# 🚀 Guía para Desarrolladores - Configuración de Keycloak Compartida

## 📌 Situación

Carlos (@carlos) ya configuró Keycloak con:
- ✅ Realm `datum-travels`
- ✅ Roles (`admin`, `usuario`)
- ✅ Client `datum-travels-frontend`
- ✅ Usuarios de prueba

Esta configuración está en el archivo `keycloak/import/datum-travels-realm.json` y se importa **automáticamente**.

---

## 🎯 Pasos para Desarrolladores Nuevos

### Escenario 1: Primera vez levantando Keycloak

Si **NUNCA** has levantado Keycloak en tu máquina:

```powershell
# 1. Pull de los cambios de Carlos
git pull origin carlos

# 2. Levantar Docker (Keycloak se configura solo)
docker-compose -f docker-compose-dev.yml up -d

# 3. Esperar ~90 segundos a que Keycloak inicie

# 4. Verificar en el navegador
# http://localhost:8180
# Login: admin / admin2025
```

**✅ ¡Listo!** El realm `datum-travels` ya estará configurado con todo.

---

### Escenario 2: Ya tenías Keycloak corriendo ANTES del pull

Si **YA** levantaste Keycloak antes (sin la configuración de Carlos):

#### Opción A: Empezar limpio (Recomendado)

```powershell
# 1. Pull de los cambios
git pull origin carlos

# 2. Bajar Keycloak y BORRAR sus datos
docker-compose -f docker-compose-dev.yml down -v

# 3. Volver a levantar (importará la configuración)
docker-compose -f docker-compose-dev.yml up -d

# 4. Esperar ~90 segundos

# 5. Verificar
# http://localhost:8180
```

**✅ Listo.** Ahora tienes la misma configuración que Carlos.

#### Opción B: Mantener tus datos existentes (No recomendado)

Si ya tienes datos en Keycloak que no quieres perder:

```powershell
# 1. Pull de los cambios
git pull origin carlos

# 2. Importar manualmente desde la UI
# - Ve a http://localhost:8180
# - Login: admin / admin2025
# - Realm settings → Action → Partial import
# - Selecciona el archivo: keycloak/import/datum-travels-realm.json
# - Click "Import"
```

⚠️ **Cuidado:** Puede haber conflictos si ya tienes un realm llamado `datum-travels`.

---

## 🔄 Cuando Carlos actualice la configuración

Si Carlos hace cambios en Keycloak (nuevos roles, usuarios, etc.) y sube el archivo actualizado:

```powershell
# 1. Pull de los cambios
git pull origin carlos

# 2. Reiniciar Keycloak
docker-compose -f docker-compose-dev.yml restart datum-keycloak

# 3. Esperar ~30 segundos
```

**Nota:** Si el reinicio no aplica los cambios, usa la **Opción A** del Escenario 2.

---

## ✅ Verificar que la Importación Funcionó

1. Abre: **http://localhost:8180**
2. Login: `admin` / `admin2025`
3. **Verifica:**
   - En el dropdown superior izquierdo, debe aparecer el realm **`datum-travels`**
   - Selecciónalo y ve a **"Realm roles"** → Debes ver los roles `admin` y `usuario`
   - Ve a **"Clients"** → Debe existir `datum-travels-frontend`
   - Ve a **"Users"** → Debes ver los usuarios de prueba (si Carlos los exportó)

---

## 🆘 Solución de Problemas

### ❌ No veo el realm `datum-travels`

**Causa:** La importación no se ejecutó.

**Solución:**
```powershell
# Verificar que existe el archivo
ls .\keycloak\import\

# Debe mostrar: datum-travels-realm.json

# Si existe, reiniciar con volúmenes limpios
docker-compose -f docker-compose-dev.yml down -v
docker-compose -f docker-compose-dev.yml up -d
```

### ❌ Error: "Realm already exists"

**Causa:** Ya tienes un realm llamado `datum-travels` con configuración diferente.

**Solución:**
```powershell
# Opción 1: Borrar todo y empezar limpio
docker-compose -f docker-compose-dev.yml down -v
docker-compose -f docker-compose-dev.yml up -d

# Opción 2: Borrar el realm manualmente
# - Ve a http://localhost:8180
# - Selecciona realm 'datum-travels'
# - Realm settings → Action → Delete
# - Reinicia Keycloak
docker-compose -f docker-compose-dev.yml restart datum-keycloak
```

### ❌ Los usuarios no aparecen

**Causa:** Carlos no exportó los usuarios, o están protegidos.

**Solución:**
- Los usuarios se deben crear manualmente, O
- Pedirle a Carlos que exporte nuevamente con la opción "Export users" marcada

---

## 📊 Diagrama del Flujo

```
┌─────────────────────────────────────────────┐
│  Desarrollador Nuevo                        │
├─────────────────────────────────────────────┤
│  1. git pull origin carlos                  │
│     ↓                                       │
│  2. docker-compose up -d                    │
│     ↓                                       │
│  3. Keycloak arranca                        │
│     ↓                                       │
│  4. Lee: keycloak/import/*.json             │
│     ↓                                       │
│  5. Importa automáticamente (--import-realm)│
│     ↓                                       │
│  6. ✅ Realm configurado                    │
└─────────────────────────────────────────────┘
```

---

## 🔑 Credenciales de Desarrollo

### Keycloak Admin Console
- **URL:** http://localhost:8180
- **Usuario:** `admin`
- **Password:** `admin2025`

### Usuarios de Prueba (si fueron exportados)
Consulta con Carlos (@carlos) o revisa en:
- http://localhost:8180 → Realm `datum-travels` → Users

---

## 📚 Referencias

- **Documentación completa:** `keycloak/README.md`
- **Configuración compartida:** `keycloak/import/datum-travels-realm.json`
- **Docker Compose:** `docker-compose-dev.yml` (servicio `datum-keycloak`)

---

## 💡 Recordatorios

✅ **SÍ hacer:**
- Pull antes de levantar Docker
- Usar `down -v` si tienes problemas
- Verificar en la UI que todo se importó correctamente

❌ **NO hacer:**
- Configurar Keycloak manualmente (usa la configuración compartida)
- Editar el archivo `datum-travels-realm.json` directamente
- Cambiar credenciales del admin de Keycloak

---

**Mantenido por:** @carlos  
**Última actualización:** 29 de Octubre, 2025  
**Keycloak Version:** 26.0.7
