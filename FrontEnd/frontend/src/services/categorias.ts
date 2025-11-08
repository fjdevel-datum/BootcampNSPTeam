/**
 * Servicio para manejar categorías de gasto
 */

import { API_BASE_URL } from "../config/constants";
import { getValidAccessToken } from "./authService";

export interface CategoriaGasto {
  idCategoria: number;
  nombreCategoria: string;
}

/**
 * Obtener todas las categorías de gasto disponibles
 *
 * 🔐 INTEGRACIÓN KEYCLOAK:
 * - Requiere token de autenticación válido
 * - El backend valida permisos automáticamente
 */
export async function obtenerCategorias(): Promise<CategoriaGasto[]> {
  try {
    // Obtener token válido (refresca si es necesario)
    const token = await getValidAccessToken();

    if (!token) {
      throw new Error("No hay sesión activa. Por favor inicia sesión.");
    }

    const response = await fetch(`${API_BASE_URL}/categorias`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener categorías: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error en obtenerCategorias:", error);
    throw error;
  }
}
