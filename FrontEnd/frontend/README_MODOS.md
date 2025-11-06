# ============================================================================
# Datum Travels - Scripts para cambiar entre modo LOCAL y LAN
# ============================================================================

## 📱 Para usar desde CELULAR (LAN):
```powershell
.\iniciar-lan.ps1
```

## 💻 Para usar desde TU PC (localhost):
```powershell
.\iniciar-local.ps1
```

## ⚙️ Diferencias:

### Modo LOCAL (localhost:5173)
- Keycloak: http://localhost:8180
- Backend: http://localhost:8081
- OCR: http://localhost:8080
- ✅ **Usa este modo para desarrollo normal en tu PC**

### Modo LAN (192.168.1.6:5173)
- Keycloak: http://192.168.1.6:8180
- Backend: http://192.168.1.6:8081
- OCR: http://192.168.1.6:8080
- ✅ **Usa este modo para probar desde celular**

## 🔧 Configuración Manual

Si prefieres cambiar manualmente:

1. Copia `.env.local` a `.env` para modo LOCAL
2. Copia `.env.lan` a `.env` para modo LAN
3. Reinicia el frontend: `npm run dev`
