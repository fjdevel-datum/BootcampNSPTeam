# 🔐 Configuración Compartida de Keycloak

## 📂 Estructura

```
keycloak/
├── import/
│   └── datum-travels-realm.json    ← Configuración que se importa automáticamente
└── README.md                        ← Este archivo
```

---

## 🚀 Para Nuevos Desarrolladores

Cuando clones el repo y ejecutes:

```powershell
docker-compose -f docker-compose-dev.yml up -d
```

**Keycloak se configurará automáticamente** con:
- ✅ Realm `datum-travels`
- ✅ Roles (admin, usuario)
- ✅ Clients (datum-travels-frontend)
- ✅ Usuarios de prueba (si fueron exportados)

**No necesitas hacer nada manual.** Solo espera ~90 segundos a que Keycloak inicie.

---

## 📤 Actualizar la Configuración (Para quien hizo cambios en Keycloak)

### 1. Exportar desde la UI de Keycloak

1. Ve a: http://localhost:8180
2. Login: `admin` / `admin2025`
3. Selecciona el realm **`datum-travels`**
4. **Realm settings** → **Action** → **Partial export**
5. Marca:
   - ☑ Export groups and roles
   - ☑ Export clients
   - ☑ Export users (opcional)
6. Click **"Export"**

### 2. Guardar el archivo

Renombra el archivo descargado (`realm-export.json`) a `datum-travels-realm.json` y guárdalo en:

```
keycloak/import/datum-travels-realm.json
```

### 3. Commit al repositorio

```powershell
git add keycloak/import/datum-travels-realm.json
git commit -m "chore(keycloak): actualizar configuración del realm"
git push
```

---

## 🔄 Cuando Otros Devs Reciban la Actualización

```powershell
# 1. Pull cambios
git pull

# 2. Reiniciar Keycloak
docker-compose -f docker-compose-dev.yml restart datum-keycloak

# ✅ Los cambios se aplican automáticamente
```

---

## 🆘 Solución de Problemas

### La configuración no se importa

**Opción 1:** Empezar con un Keycloak limpio
```powershell
docker-compose -f docker-compose-dev.yml down -v
docker-compose -f docker-compose-dev.yml up -d
```

**Opción 2:** Verificar que existe el archivo
```powershell
ls .\keycloak\import\
# Debe mostrar: datum-travels-realm.json
```

---

## 📝 Notas

- El archivo `datum-travels-realm.json` está versionado en Git
- Contiene toda la configuración del realm para compartir con el equipo
- Se importa automáticamente gracias al flag `--import-realm` en docker-compose
- Solo para desarrollo (no incluir passwords reales para producción)
