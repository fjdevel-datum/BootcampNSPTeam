/**
 * Servicio para manejar categorías de gasto
 */

export interface CategoriaGasto {
  idCategoria: number;
  nombreCategoria: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

/**
 * Obtener todas las categorías de gasto disponibles
 */
export async function obtenerCategorias(): Promise<CategoriaGasto[]> {
  const response = await fetch(`${API_BASE_URL}/api/categorias`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener categorías: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
