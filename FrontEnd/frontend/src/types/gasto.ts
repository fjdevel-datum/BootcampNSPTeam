export interface GastoBackend {
  idGasto: number;
  idEvento: number;
  nombreEvento: string | null;
  idCategoria: number | null;
  nombreCategoria: string | null;
  idTarjeta: number | null;
  numeroTarjeta: string | null;
  descripcion: string | null;
  lugar: string | null;
  fecha: string | null;
  monto: number | null;
  moneda: string | null;
  montoUsd: number | null;
  tasaCambio: number | null;
  fechaTasaCambio: string | null;
  tieneComprobante: boolean;
}

export interface GastoFormData {
  nombreEmpresa: string;
  descripcion: string;
  montoTotal: string;
  fecha: string; // Expected in yyyy-MM-dd format for the date input
  moneda: string; // Código ISO 4217: USD, GTQ, HNL, PAB, EUR
  idCategoria: string; // ID de la categoría seleccionada
  idTarjeta?: string; // ID de la tarjeta corporativa (opcional)
}

