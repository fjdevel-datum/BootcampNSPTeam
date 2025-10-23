import type { EventoBackend } from "../types/event";

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
   * Obtiene todos los eventos de un empleado
   * 
   * @param idEmpleado - ID del empleado (opcional si el backend usa simulación)
   * @returns Lista de eventos del empleado
   */
  async listarEventos(idEmpleado?: number): Promise<EventoBackend[]> {
    try {
      // Construir URL con query param si se proporciona idEmpleado
      const url = idEmpleado 
        ? `${API_BASE_URL}/api/eventos?idEmpleado=${idEmpleado}`
        : `${API_BASE_URL}/api/eventos`; // Usa simulación del backend

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
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
      const response = await fetch(`${API_BASE_URL}/api/eventos/${idEvento}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
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
   * Crea un nuevo evento
   * 
   * @param nombreEvento - Nombre del evento
   * @param idEmpleado - ID del empleado (opcional si el backend usa simulación)
   * @returns Evento creado
   */
  async crearEvento(nombreEvento: string, idEmpleado?: number): Promise<EventoBackend> {
    try {
      const requestBody = idEmpleado 
        ? { nombreEvento, idEmpleado }
        : { nombreEvento };

      const response = await fetch(`${API_BASE_URL}/api/eventos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Error al crear evento: ${response.status} ${response.statusText}`);
      }

      const evento: EventoBackend = await response.json();
      return evento;
    } catch (error) {
      console.error("Error en crearEvento:", error);
      throw error;
    }
  },
};
