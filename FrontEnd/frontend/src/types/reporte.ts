// Tipos para envío de reportes de gastos

/**
 * Destinatario de reporte por país
 */
export interface DestinatarioReporte {
  codigoPais: string;
  nombrePais: string;
  email: string;
  asuntoEjemplo: string;
}

/**
 * Request para enviar reporte de gastos
 */
export interface EnviarReporteRequest {
  emailDestino: string;
  codigoPais: string;
  nombreProveedor?: string;
  formato: 'PDF' | 'EXCEL';
}

/**
 * Response al enviar reporte
 */
export interface EnviarReporteResponse {
  exitoso: boolean;
  mensaje: string;
  emailDestino?: string;
  asunto?: string;
  formato?: string;
  cantidadGastos?: number;
}
