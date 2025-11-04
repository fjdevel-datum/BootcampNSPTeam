export interface GastoFormData {
  nombreEmpresa: string;
  descripcion: string;
  montoTotal: string;
  fecha: string; // Expected in yyyy-MM-dd format for the date input
  moneda: string; // Código ISO 4217: USD, GTQ, HNL, PAB, EUR
  idCategoria: string; // ID de la categoría seleccionada
  idTarjeta?: string; // ID de la tarjeta corporativa (opcional)
}

