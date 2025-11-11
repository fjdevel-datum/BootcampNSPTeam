/**
 * EJEMPLO PRÁCTICO - Cómo usar la integración de Keycloak
 * 
 * Este archivo muestra ejemplos reales de uso en diferentes componentes
 */

// ============================================================================
// EJEMPLO 1: Usar useAuth en un componente
// ============================================================================

import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

function ExampleComponent() {
  const navigate = useNavigate();
  const { 
    user,              // Info del usuario actual
    isAuthenticated,   // ¿Está logueado?
    isAdmin,           // ¿Es administrador?
    hasRole,           // Verificar rol específico
    logout             // Función de logout
  } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div>
      {/* Mostrar info solo si está autenticado */}
      {isAuthenticated && (
        <div>
          <h2>Bienvenido {user?.name}</h2>
          <p>Email: {user?.email}</p>
          <p>Username: {user?.username}</p>
        </div>
      )}

      {/* Botón solo para admins */}
      {isAdmin() && (
        <button onClick={() => navigate('/admin')}>
          Ir al Panel de Administración
        </button>
      )}

      {/* Verificar rol específico */}
      {hasRole('contador') && (
        <button onClick={() => navigate('/reportes')}>
          Ver Reportes Contables
        </button>
      )}

      {/* Botón de logout */}
      <button onClick={handleLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
}

// ============================================================================
// EJEMPLO 2: Proteger una ruta en router/index.tsx
// ============================================================================

import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleGuard from '../components/RoleGuard';

const router = createBrowserRouter([
  // Ruta pública - no requiere login
  {
    path: '/',
    element: <LoginPage />
  },

  // Ruta protegida - requiere login (cualquier usuario)
  {
    path: '/home',
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    )
  },

  // Ruta con rol específico - solo administradores
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['admin', 'administrador']}>
          <AdminDashboard />
        </RoleGuard>
      </ProtectedRoute>
    )
  },

  // Ruta para múltiples roles - admin o contador
  {
    path: '/reportes',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['admin', 'contador']}>
          <ReportesPage />
        </RoleGuard>
      </ProtectedRoute>
    )
  }
]);

// ============================================================================
// EJEMPLO 3: Login page completo
// ============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function LoginPageExample() {
  const navigate = useNavigate();
  const { login, isAdmin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Login con Keycloak
      await login({ username, password });

      // Redirigir según rol
      if (isAdmin()) {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Usuario"
        required
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
      />

      {error && <p className="error">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );
}

// ============================================================================
// EJEMPLO 4: Layout con navegación condicional
// ============================================================================

import { Link } from 'react-router-dom';
import UserNav from '../components/UserNav';
import { useAuth } from '../hooks/useAuth';

function LayoutExample({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();

  return (
    <div>
      <header>
        <nav>
          <Link to="/home">Inicio</Link>
          <Link to="/profile">Perfil</Link>
          
          {/* Link solo visible para admins */}
          {isAdmin() && (
            <Link to="/admin">Panel Admin</Link>
          )}
        </nav>

        {/* Componente con info de usuario y logout */}
        <UserNav />
      </header>

      <main>{children}</main>
    </div>
  );
}

// ============================================================================
// EJEMPLO 5: Hacer peticiones autenticadas al backend
// ============================================================================

import { getValidAccessToken } from '../services/authService';

async function fetchEventosExample() {
  try {
    // Obtener token válido (se refresca automáticamente si expiró)
    const token = await getValidAccessToken();

    if (!token) {
      throw new Error('No hay sesión activa');
    }

    // Hacer petición con token
    const response = await fetch('http://localhost:8081/api/eventos', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener eventos');
    }

    const eventos = await response.json();
    return eventos;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// O crear un helper reutilizable:
async function fetchWithAuth(url: string, options?: RequestInit) {
  const token = await getValidAccessToken();
  
  if (!token) {
    throw new Error('No autenticado');
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      'Authorization': `Bearer ${token}`,
    }
  });
}

// Uso:
const eventos = await fetchWithAuth('/api/eventos').then(r => r.json());
const evento = await fetchWithAuth('/api/eventos/1').then(r => r.json());

// ============================================================================
// EJEMPLO 6: Verificar roles en lógica de componente
// ============================================================================

function DashboardExample() {
  const { user, hasRole, isAdmin } = useAuth();

  const renderContent = () => {
    // Admin ve todo
    if (isAdmin()) {
      return (
        <div>
          <h2>Panel de Administración</h2>
          <AdminStats />
          <AllUsers />
          <SystemSettings />
        </div>
      );
    }

    // Contador ve reportes
    if (hasRole('contador')) {
      return (
        <div>
          <h2>Reportes Contables</h2>
          <FinancialReports />
        </div>
      );
    }

    // Usuario normal
    return (
      <div>
        <h2>Mis Eventos</h2>
        <UserEvents />
      </div>
    );
  };

  return (
    <div>
      <h1>Bienvenido {user?.name}</h1>
      {renderContent()}
    </div>
  );
}

// ============================================================================
// EJEMPLO 7: Mostrar/ocultar elementos según rol
// ============================================================================

function NavigationExample() {
  const { hasRole, isAdmin } = useAuth();

  return (
    <nav>
      {/* Visible para todos los autenticados */}
      <a href="/home">Inicio</a>
      <a href="/eventos">Mis Eventos</a>
      
      {/* Solo para usuarios con rol 'contador' */}
      {hasRole('contador') && (
        <a href="/reportes">Reportes</a>
      )}
      
      {/* Solo para administradores */}
      {isAdmin() && (
        <>
          <a href="/admin">Panel Admin</a>
          <a href="/admin/usuarios">Usuarios</a>
          <a href="/admin/configuracion">Configuración</a>
        </>
      )}
    </nav>
  );
}

// ============================================================================
// EJEMPLO 8: Botón condicional con verificación de rol
// ============================================================================

function EventCardExample({ evento }: { evento: Event }) {
  const { isAdmin, user } = useAuth();

  const canEdit = isAdmin() || evento.userId === user?.username;
  const canDelete = isAdmin();

  return (
    <div className="event-card">
      <h3>{evento.nombre}</h3>
      <p>{evento.descripcion}</p>

      <div className="actions">
        {/* Editar: admin o dueño del evento */}
        {canEdit && (
          <button onClick={() => editEvent(evento.id)}>
            Editar
          </button>
        )}

        {/* Eliminar: solo admin */}
        {canDelete && (
          <button onClick={() => deleteEvent(evento.id)}>
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// EJEMPLO 9: Interceptor automático para axios (opcional)
// ============================================================================

import axios from 'axios';
import { getValidAccessToken } from '../services/authService';

// Crear instancia de axios
const api = axios.create({
  baseURL: 'http://localhost:8081/api'
});

// Interceptor de request - agrega token automáticamente
api.interceptors.request.use(async (config) => {
  const token = await getValidAccessToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Interceptor de response - maneja errores 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token inválido - hacer logout
      const { logout } = useAuth();
      await logout();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Uso:
const eventos = await api.get('/eventos');
const evento = await api.post('/eventos', { nombre: 'Nuevo evento' });

// ============================================================================
// EJEMPLO 10: Guardar y restaurar sesión (persistencia)
// ============================================================================

// El sistema ya guarda tokens en localStorage automáticamente
// Al recargar la página, AuthContext los restaura:

// 1. Usuario hace login
await login({ username: 'admin.test', password: 'admin123' });
// → Tokens guardados en localStorage

// 2. Usuario recarga página (F5)
// → AuthContext lee localStorage en useEffect
// → Si tokens válidos: isAuthenticated = true
// → Usuario sigue logueado ✅

// 3. Usuario cierra pestaña y vuelve más tarde
// → Si token no expiró: sigue logueado
// → Si token expiró pero refresh_token válido: refresca automáticamente
// → Si ambos expiraron: redirige a login

// ============================================================================
// EJEMPLO 11: Custom hook para datos de usuario
// ============================================================================

function useCurrentUser() {
  const { user, isAuthenticated } = useAuth();

  return {
    username: user?.username || 'Invitado',
    email: user?.email || '',
    displayName: user?.name || user?.username || 'Usuario',
    roles: user?.roles || [],
    isAuthenticated,
    isGuest: !isAuthenticated,
  };
}

// Uso:
function ProfilePage() {
  const { displayName, email, roles } = useCurrentUser();

  return (
    <div>
      <h1>{displayName}</h1>
      <p>{email}</p>
      <p>Roles: {roles.join(', ')}</p>
    </div>
  );
}

// ============================================================================
// RESUMEN DE USO
// ============================================================================

/*
1. Para proteger rutas:
   - ProtectedRoute (requiere login)
   - RoleGuard (requiere rol específico)

2. Para acceder a datos de autenticación:
   - useAuth() hook

3. Para hacer peticiones al backend:
   - getValidAccessToken() + fetch
   - O configurar axios con interceptors

4. Para mostrar/ocultar UI:
   - isAdmin()
   - hasRole('nombre-rol')
   - isAuthenticated

5. Para logout:
   - const { logout } = useAuth()
   - await logout()
*/

export {};
