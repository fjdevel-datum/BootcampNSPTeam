/**
 * Servicio para gestionar empleados desde el panel de administracion.
 */

import { getValidAccessToken } from "./authService";
import type { CrearEmpleadoPayload, EmpleadoResponse } from "../types/empleado";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

/**
 * Crea un nuevo empleado en el sistema (solo para administradores).
 */
export async function crearEmpleado(payload: CrearEmpleadoPayload): Promise<EmpleadoResponse> {
  const token = await getValidAccessToken();

  if (!token) {
    throw new Error("No hay sesion activa. Por favor inicia sesion.");
  }

  const response = await fetch(`${API_BASE_URL}/api/empleados`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const contentType = response.headers.get("Content-Type") ?? "";
    let detail = await response.text();

    if (contentType.includes("application/json") && detail) {
      try {
        const parsed = JSON.parse(detail) as { message?: string };
        detail = parsed?.message ?? detail;
      } catch {
        // ignore parse errors, fallback to raw detail
      }
    }

    const message = detail || response.statusText || "No se pudo crear el empleado.";
    throw new Error(`Error al crear empleado: ${message}`);
  }

  const data: EmpleadoResponse = await response.json();
  return data;
}
