import type { GastoBackend } from "../types/gasto";
import { getValidAccessToken } from "./authService";

const API_BASE_URL = "http://localhost:8081";

export const gastosService = {
  async listarPorEvento(idEvento: number): Promise<GastoBackend[]> {
    const token = await getValidAccessToken();

    if (!token) {
      throw new Error("No hay sesión activa. Por favor inicia sesión.");
    }

    const response = await fetch(`${API_BASE_URL}/api/gastos/evento/${idEvento}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Error al obtener los gastos del evento (${response.status} ${response.statusText})${
          errorText ? `: ${errorText}` : ""
        }`
      );
    }

    return (await response.json()) as GastoBackend[];
  },
};
