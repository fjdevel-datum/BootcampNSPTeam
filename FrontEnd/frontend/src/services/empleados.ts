/**
 * Servicio para gestionar empleados desde el panel de administracion.
 */

import { API_BASE_URL } from "../config/constants";
import type {
  ActualizarPerfilPayload,
  CrearEmpleadoPayload,
  EmpleadoResponse,
  PerfilEmpleado,
  UsuarioAdmin,
} from "../types/empleado";
import { getValidAccessToken } from "./authService";

/**
 * Obtiene el perfil del empleado autenticado.
 */
export async function obtenerPerfil(): Promise<PerfilEmpleado> {
  const token = await getValidAccessToken();

  if (!token) {
    throw new Error("No hay sesion activa. Por favor inicia sesion.");
  }

  const response = await fetch(`${API_BASE_URL}/empleados/perfil`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "No se pudo obtener el perfil.");
  }

  return response.json();
}

/**
 * Actualiza el perfil del empleado autenticado.
 */
export async function actualizarPerfil(payload: ActualizarPerfilPayload): Promise<PerfilEmpleado> {
  const token = await getValidAccessToken();

  if (!token) {
    throw new Error("No hay sesion activa. Por favor inicia sesion.");
  }

  const response = await fetch(`${API_BASE_URL}/empleados/perfil`, {
    method: "PUT",
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

    const message = detail || response.statusText || "No se pudo actualizar el perfil.";
    throw new Error(`Error al actualizar perfil: ${message}`);
  }

  return response.json();
}

/**
 * Crea un nuevo empleado en el sistema (solo para administradores).
 */
export async function crearEmpleado(payload: CrearEmpleadoPayload): Promise<EmpleadoResponse> {
  const token = await getValidAccessToken();

  if (!token) {
    throw new Error("No hay sesion activa. Por favor inicia sesion.");
  }

  const response = await fetch(`${API_BASE_URL}/empleados`, {
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

export async function listarEmpleados(): Promise<UsuarioAdmin[]> {
  const token = await getValidAccessToken();

  if (!token) {
    throw new Error("No hay sesion activa. Por favor inicia sesion.");
  }

  const response = await fetch(`${API_BASE_URL}/empleados`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "No se pudo obtener el listado de empleados.");
  }

  return response.json();
}
