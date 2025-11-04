/**
 * Servicio para gestionar tarjetas corporativas
 */

import { API_BASE_URL } from "../config/constants";
import type { AsignarTarjetaRequest, Tarjeta, TarjetaRequest } from "../types/tarjeta";
import { getValidAccessToken } from "./authService";

/**
 * Obtiene todas las tarjetas corporativas registradas.
 */
export async function listarTarjetas(): Promise<Tarjeta[]> {
  const token = await getValidAccessToken();

  if (!token) {
    throw new Error("No hay sesión activa. Por favor inicia sesión.");
  }

  const response = await fetch(`${API_BASE_URL}/tarjetas`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "No se pudo obtener el listado de tarjetas.");
  }

  return response.json();
}

/**
 * Obtiene las tarjetas asignadas al usuario autenticado.
 */
export async function obtenerMisTarjetas(): Promise<Tarjeta[]> {
  const token = await getValidAccessToken();

  if (!token) {
    throw new Error("No hay sesión activa. Por favor inicia sesión.");
  }

  const response = await fetch(`${API_BASE_URL}/tarjetas/mis-tarjetas`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "No se pudieron obtener tus tarjetas.");
  }

  return response.json();
}

/**
 * Crea una nueva tarjeta corporativa (solo para administradores).
 */
export async function crearTarjeta(payload: TarjetaRequest): Promise<Tarjeta> {
  const token = await getValidAccessToken();

  if (!token) {
    throw new Error("No hay sesión activa. Por favor inicia sesión.");
  }

  const response = await fetch(`${API_BASE_URL}/tarjetas`, {
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

    const message = detail || response.statusText || "No se pudo crear la tarjeta.";
    throw new Error(`Error al crear tarjeta: ${message}`);
  }

  const data: Tarjeta = await response.json();
  return data;
}

/**
 * Asigna una tarjeta a un empleado (solo para administradores).
 */
export async function asignarTarjeta(payload: AsignarTarjetaRequest): Promise<Tarjeta> {
  const token = await getValidAccessToken();

  if (!token) {
    throw new Error("No hay sesión activa. Por favor inicia sesión.");
  }

  const response = await fetch(`${API_BASE_URL}/tarjetas/asignar`, {
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
        // ignore parse errors
      }
    }

    const message = detail || response.statusText || "No se pudo asignar la tarjeta.";
    throw new Error(`Error al asignar tarjeta: ${message}`);
  }

  const data: Tarjeta = await response.json();
  return data;
}

/**
 * Elimina una tarjeta corporativa (solo para administradores).
 */
export async function eliminarTarjeta(idTarjeta: number): Promise<void> {
  const token = await getValidAccessToken();

  if (!token) {
    throw new Error("No hay sesión activa. Por favor inicia sesión.");
  }

  const response = await fetch(`${API_BASE_URL}/tarjetas/${idTarjeta}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const contentType = response.headers.get("Content-Type") ?? "";
    let detail = await response.text();

    if (contentType.includes("application/json") && detail) {
      try {
        const parsed = JSON.parse(detail) as { message?: string };
        detail = parsed?.message ?? detail;
      } catch {
        // ignore parse errors
      }
    }

    const message = detail || response.statusText || "No se pudo eliminar la tarjeta.";
    throw new Error(`Error al eliminar tarjeta: ${message}`);
  }
}
