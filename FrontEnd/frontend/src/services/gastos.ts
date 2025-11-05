import { API_BASE_URL } from "../config/constants";
import type { ActualizarGastoPayload, GastoBackend } from "../types/gasto";
import { getValidAccessToken } from "./authService";

export const gastosService = {
  async listarPorEvento(idEvento: number): Promise<GastoBackend[]> {
    const token = await getValidAccessToken();

    if (!token) {
      throw new Error("No hay sesion activa. Por favor inicia sesion.");
    }

    const response = await fetch(`${API_BASE_URL}/gastos/evento/${idEvento}`, {
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

  async actualizar(idGasto: number, payload: ActualizarGastoPayload): Promise<GastoBackend> {
    const token = await getValidAccessToken();

    if (!token) {
      throw new Error("No hay sesion activa. Por favor inicia sesion.");
    }

    const response = await fetch(`${API_BASE_URL}/gastos/${idGasto}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Error al actualizar el gasto (${response.status} ${response.statusText})${
          errorText ? `: ${errorText}` : ""
        }`
      );
    }

    return (await response.json()) as GastoBackend;
  },

  async eliminar(idGasto: number): Promise<void> {
    const token = await getValidAccessToken();

    if (!token) {
      throw new Error("No hay sesion activa. Por favor inicia sesion.");
    }

    const response = await fetch(`${API_BASE_URL}/gastos/${idGasto}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Error al eliminar el gasto (${response.status} ${response.statusText})${
          errorText ? `: ${errorText}` : ""
        }`
      );
    }
  },
};
