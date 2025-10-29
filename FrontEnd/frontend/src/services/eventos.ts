import type { EventoBackend } from "../types/event";
import { getValidAccessToken } from "./authService";

/**
 * URL base del API de Quarkus
 * 
 * 🔧 Ajustar según configuración:
 * - Desarrollo local: http://localhost:8081 (puerto configurado en application.properties)
 * - Producción: cambiar a la URL del servidor
 */
const API_BASE_URL = "http://localhost:8081";

/**
 * Servicio para gestión de eventos
 */
export const eventosService = {
  /**
   * Obtiene todos los eventos del empleado autenticado
   * 
   * ✅ INTEGRACIÓN KEYCLOAK:
   * - Ya no acepta idEmpleado como parámetro
   * - El backend obtiene automáticamente el empleado del JWT
   * - Requiere token de autenticación válido
   * 
   * @returns Lista de eventos del empleado autenticado
   */
  async listarEventos(): Promise<EventoBackend[]> {
    try {
      // Obtener token válido (refresca si es necesario)
      const token = await getValidAccessToken();
      
      if (!token) {
        throw new Error("No hay sesión activa. Por favor inicia sesión.");
      }

      const response = await fetch(`${API_BASE_URL}/api/eventos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // 🔐 Token JWT
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
   * 
   * @param idEvento - ID del evento
   * @returns Detalle del evento
   */
  async obtenerEvento(idEvento: number): Promise<EventoBackend> {
    try {
      const token = await getValidAccessToken();
      
      if (!token) {
        throw new Error("No hay sesión activa. Por favor inicia sesión.");
      }

      const response = await fetch(`${API_BASE_URL}/api/eventos/${idEvento}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // 🔐 Token JWT
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
   * 
   * ✅ INTEGRACIÓN KEYCLOAK:
   * - Ya no acepta idEmpleado como parámetro
   * - El backend asigna automáticamente el empleado del JWT
   * - Requiere token de autenticación válido
   * 
   * @param nombreEvento - Nombre del evento
   * @returns Evento creado
   */
  async crearEvento(nombreEvento: string): Promise<EventoBackend> {
    try {
      const token = await getValidAccessToken();
      
      if (!token) {
        throw new Error("No hay sesión activa. Por favor inicia sesión.");
      }

      const response = await fetch(`${API_BASE_URL}/api/eventos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // 🔐 Token JWT
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
   * 
   * @param idEvento - ID del evento a eliminar
   */
  async eliminarEvento(idEvento: number): Promise<void> {
    try {
      const token = await getValidAccessToken();
      
      if (!token) {
        throw new Error("No hay sesión activa. Por favor inicia sesión.");
      }

      const response = await fetch(`${API_BASE_URL}/api/eventos/${idEvento}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // 🔐 Token JWT
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
