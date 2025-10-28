# 🧪 Pruebas de Navegación - Keycloak Integration

## ✅ Test 1: Login Normal

**Pasos:**
1. Abre http://localhost:5173 (modo incógnito)
2. Login con `carlos.martinez` / `admin123`
3. Verifica que redirige a `/admin`
4. Presiona ← Atrás en el navegador

**Resultado Esperado:**
- ✅ NO regresa a `/login`
- ✅ Sale de la aplicación o va a página externa

---

## ✅ Test 2: Usuario Ya Logueado Intenta Acceder a Login

**Pasos:**
1. Usuario ya logueado en `/home`
2. En la barra de direcciones, escribe: `http://localhost:5173/`
3. Presiona Enter

**Resultado Esperado:**
- ✅ NO muestra el formulario de login
- ✅ Redirige automáticamente a `/home`
- ✅ En consola aparece: "🔒 Usuario ya autenticado, redirigiendo..."

---

## ✅ Test 3: Logout Funciona Correctamente

**Pasos:**
1. Usuario logueado en `/home`
2. Click en botón "Salir"
3. Verifica que redirige a `/login`
4. Presiona ← Atrás en el navegador

**Resultado Esperado:**
- ✅ Redirige a `/login`
- ✅ LocalStorage limpio (sin tokens)
- ✅ Presionar ← Atrás NO regresa a `/home`
- ✅ Sale de la aplicación

---

## ✅ Test 4: Navegación Múltiple

**Pasos:**
1. Login con `ana.rodriguez` (usuario normal)
2. Redirige a `/home`
3. Navega a `/profile`
4. Navega a `/tarjetas`
5. Presiona ← Atrás (regresa a `/profile`)
6. Presiona ← Atrás (regresa a `/home`)
7. Presiona ← Atrás

**Resultado Esperado:**
- ✅ Sale de la aplicación (NO regresa a `/login`)

---

## ✅ Test 5: Admin No Puede Acceder Sin Rol

**Pasos:**
1. Login con `ana.rodriguez` (solo rol usuario)
2. Redirige a `/home`
3. Escribe manualmente: `http://localhost:5173/admin`
4. Presiona Enter

**Resultado Esperado:**
- ✅ RoleGuard bloquea acceso
- ✅ Redirige a `/home`

---

## ✅ Test 6: Flecha Adelante (→)

**Pasos:**
1. Login → redirige a `/home`
2. Navega a `/profile`
3. Presiona ← Atrás (regresa a `/home`)
4. Presiona → Adelante

**Resultado Esperado:**
- ✅ Regresa a `/profile`
- ✅ Navegación normal entre rutas protegidas

---

## 🎯 Checklist Rápido

Antes de dar por completo:

- [ ] Login admin redirige a `/admin`
- [ ] Login usuario redirige a `/home`
- [ ] ← Atrás desde dashboard NO va a login
- [ ] Usuario logueado que escribe `/` es redirigido
- [ ] Logout funciona y limpia tokens
- [ ] ← Atrás después de logout NO regresa a dashboard
- [ ] RoleGuard bloquea acceso a `/admin` para usuarios normales
- [ ] → Adelante funciona entre rutas protegidas

---

## 🐛 Si Algo Falla

### Problema: Logout no funciona

**Verificar:**
1. Abrir DevTools → Console
2. Ver si hay errores al hacer click en "Salir"
3. Verificar que `navigate('/', { replace: true })` se ejecuta

**Solución:**
```typescript
// En UserNav.tsx debe estar:
const handleLogout = async () => {
  await logout();
  navigate('/', { replace: true });
};
```

---

### Problema: Sigue regresando a login con ← Atrás

**Verificar:**
1. Que `navigate` tenga `{ replace: true }` en Login.tsx línea ~62
2. Que el `useEffect` en Login.tsx esté activo

**Solución:**
```typescript
// Debe tener replace: true
navigate('/admin', { replace: true });
```

---

### Problema: "Usuario ya autenticado" aparece en loop

**Causa:** El `useEffect` se está ejecutando infinitamente

**Solución:**
```typescript
// Verificar que tenga las dependencias correctas
useEffect(() => {
  if (isAuthenticated) {
    // ... código
  }
}, [isAuthenticated, navigate]); // ← Estas dependencias
```

---

**Fecha:** Octubre 27, 2025
