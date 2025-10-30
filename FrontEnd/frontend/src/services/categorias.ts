/**
 * Servicio para manejar categorías de gasto
 */

import { getValidAccessToken } from "./authService";

export interface CategoriaGasto {
  idCategoria: number;
  nombreCategoria: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

/**
 * Obtener todas las categorías de gasto disponibles
 * 
 * ✅ INTEGRACIÓN KEYCLOAK:
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

    const response = await fetch(`${API_BASE_URL}/api/categorias`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // 🔐 Token JWT
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
