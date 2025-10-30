import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleGuard from "../components/RoleGuard";
import HomePage from "../pages/Home";
import LoginPage from "../pages/Login";
import ProfilePage from "../pages/profile";
import EventDetailPage from "../pages/EventDetail";
import GastoFormPage from "../pages/GastoForm";
import TarjetasPage from "../pages/Tarjetas";
import AdminDashboard from "../pages/Admin/Dashboard";
import AdminUsuarios from "../pages/Admin/Usuarios";
import AdminTarjetas from "../pages/Admin/Tarjetas";
import AdminPerfil from "../pages/Admin/Perfil";
import AdminNuevoUsuario from "../pages/Admin/NuevoUsuario";

const router = createBrowserRouter([
  // Ruta pública - Login
  {
    path: "/",
    element: <LoginPage />,
  },
  
  // Rutas protegidas - Requieren autenticación
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/tarjetas",
    element: (
      <ProtectedRoute>
        <TarjetasPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/event/:eventName",
    element: (
      <ProtectedRoute>
        <EventDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/event/:eventName/gasto",
    element: (
      <ProtectedRoute>
        <GastoFormPage />
      </ProtectedRoute>
    ),
  },
  
  // Rutas de Administrador - Requieren rol 'admin' o 'administrador'
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['admin', 'administrador']}>
          <AdminDashboard />
        </RoleGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/usuarios",
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['admin', 'administrador']}>
          <AdminUsuarios />
        </RoleGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/usuarios/nuevo",
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['admin', 'administrador']}>
          <AdminNuevoUsuario />
        </RoleGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/tarjetas",
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['admin', 'administrador']}>
          <AdminTarjetas />
        </RoleGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/perfil",
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['admin', 'administrador']}>
          <AdminPerfil />
        </RoleGuard>
      </ProtectedRoute>
    ),
  },
]);

export default router;
