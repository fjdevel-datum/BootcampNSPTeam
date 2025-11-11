/**
 * Servicio para gestionar países
 */

import { API_BASE_URL } from "../config/constants";
import { getValidAccessToken } from "./authService";

export interface Pais {
  idPais: number;
  nombrePais: string;
}

/**
 * Obtiene todos los países disponibles.
 */
export async function listarPaises(): Promise<Pais[]> {
  const token = await getValidAccessToken();

  if (!token) {
    throw new Error("No hay sesión activa. Por favor inicia sesión.");
  }

  const response = await fetch(`${API_BASE_URL}/paises`, {
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
