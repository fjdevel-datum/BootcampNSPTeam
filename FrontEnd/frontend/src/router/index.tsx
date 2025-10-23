import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/Home";
import LoginPage from "../pages/Login";
import ProfilePage from "../pages/profile";
import EventDetailPage from "../pages/EventDetail";
import GastoFormPage from "../pages/GastoForm";

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
    path: "/event/:eventName",
    element: <EventDetailPage />,
  },
  {
    path: "/event/:eventName/gasto",
    element: <GastoFormPage />,
  },
]);

export default router;