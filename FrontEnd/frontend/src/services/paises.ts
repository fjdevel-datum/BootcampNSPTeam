/**
 * Servicio para gestionar países
 */

import { getValidAccessToken } from "./authService";

export interface Pais {
  idPais: number;
  nombrePais: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

/**
 * Obtiene todos los países disponibles.
 */
export async function listarPaises(): Promise<Pais[]> {
  const token = await getValidAccessToken();

  if (!token) {
    throw new Error("No hay sesión activa. Por favor inicia sesión.");
  }

  const response = await fetch(`${API_BASE_URL}/api/paises`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "No se pudo obtener el listado de países.");
  }

  return response.json();
}
