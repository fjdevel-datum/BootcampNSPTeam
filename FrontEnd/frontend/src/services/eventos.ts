import { API_BASE_URL } from "../config/constants";
import type { EventoBackend } from "../types/event";
import { getValidAccessToken } from "./authService";

/**
 * Servicio para gestión de eventos
 */
export const eventosService = {
  /**
   * Obtiene todos los eventos del empleado autenticado
   */
  async listarEventos(): Promise<EventoBackend[]> {
    try {
      const token = await getValidAccessToken();

      if (!token) {
        throw new Error("No hay sesión activa. Por favor inicia sesión.");
      }

      const response = await fetch(`${API_BASE_URL}/eventos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener eventos: ${response.status} ${response.statusText}`);
      }

      const eventos: EventoBackend[] = await response.json();
      return eventos;
    } catch (error) {
      console.error("Error en listarEventos:", error);
      throw error;
    }
  },

  /**
   * Obtiene el detalle de un evento específico
   */
  async obtenerEvento(idEvento: number): Promise<EventoBackend> {
    try {
      const token = await getValidAccessToken();

      if (!token) {
        throw new Error("No hay sesión activa. Por favor inicia sesión.");
      }

      const response = await fetch(`${API_BASE_URL}/eventos/${idEvento}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener evento: ${response.status} ${response.statusText}`);
      }

      const evento: EventoBackend = await response.json();
      return evento;
    } catch (error) {
      console.error("Error en obtenerEvento:", error);
      throw error;
    }
  },

  /**
   * Crea un nuevo evento para el empleado autenticado
   */
  async crearEvento(nombreEvento: string): Promise<EventoBackend> {
    try {
      const token = await getValidAccessToken();

      if (!token) {
        throw new Error("No hay sesión activa. Por favor inicia sesión.");
      }

      const response = await fetch(`${API_BASE_URL}/eventos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombreEvento }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al crear evento: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const evento: EventoBackend = await response.json();
      return evento;
    } catch (error) {
      console.error("Error en crearEvento:", error);
      throw error;
    }
  },

  /**
   * Elimina un evento existente
   */
  async eliminarEvento(idEvento: number): Promise<void> {
    try {
      const token = await getValidAccessToken();

      if (!token) {
        throw new Error("No hay sesión activa. Por favor inicia sesión.");
      }

      const response = await fetch(`${API_BASE_URL}/eventos/${idEvento}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar evento: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error en eliminarEvento:", error);
      throw error;
    }
  },
};
