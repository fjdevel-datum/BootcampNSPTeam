import { API_BASE_URL } from "../config/constants";
import type { DestinatarioReporte, EnviarReporteRequest, EnviarReporteResponse } from '../types/reporte';
import { getValidAccessToken } from "./authService";

/**
 * Servicio para gestión de reportes de gastos
 */
export const reportesService = {
  /**
   * Obtiene la lista de destinatarios de reportes por país
   */
  async listarDestinatarios(): Promise<DestinatarioReporte[]> {
    try {
      const token = await getValidAccessToken();

      if (!token) {
        throw new Error("No hay sesión activa. Por favor inicia sesión.");
      }

      const response = await fetch(`${API_BASE_URL}/reportes/destinatarios`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener destinatarios: ${response.status} ${response.statusText}`);
      }

      const destinatarios: DestinatarioReporte[] = await response.json();
      return destinatarios;
    } catch (error) {
      console.error("Error en listarDestinatarios:", error);
      throw error;
    }
  },

  /**
   * Envía el reporte de gastos de un evento por correo
   * @param eventoId ID del evento
   * @param data Datos del envío (destinatario, formato, etc.)
   */
  async enviarReporte(eventoId: number, data: EnviarReporteRequest): Promise<EnviarReporteResponse> {
    try {
      const token = await getValidAccessToken();

      if (!token) {
        throw new Error("No hay sesión activa. Por favor inicia sesión.");
      }

      const response = await fetch(`${API_BASE_URL}/eventos/${eventoId}/enviar-reporte`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al enviar reporte: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const resultado: EnviarReporteResponse = await response.json();
      return resultado;
    } catch (error) {
      console.error("Error en enviarReporte:", error);
      throw error;
    }
  },
};

// Exportar funciones individuales para compatibilidad
export const listarDestinatarios = reportesService.listarDestinatarios;
export const enviarReporte = reportesService.enviarReporte;

