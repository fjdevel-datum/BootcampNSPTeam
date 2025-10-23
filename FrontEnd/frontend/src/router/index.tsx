import { createBrowserRouter } from "react-router-dom";
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/home",
    element: <HomePage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "/tarjetas",
    element: <TarjetasPage />,
  },
  {
    path: "/event/:eventName",
    element: <EventDetailPage />,
  },
  {
    path: "/event/:eventName/gasto",
    element: <GastoFormPage />,
  },
  // Rutas de Administrador
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/admin/usuarios",
    element: <AdminUsuarios />,
  },
  {
    path: "/admin/tarjetas",
    element: <AdminTarjetas />,
  },
  {
    path: "/admin/perfil",
    element: <AdminPerfil />,
  },
]);

export default router;