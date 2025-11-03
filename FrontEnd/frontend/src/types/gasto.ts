export interface GastoFormData {
  nombreEmpresa: string;
  descripcion: string;
  montoTotal: string;
  fecha: string; // Expected in yyyy-MM-dd format for the date input
  idCategoria: string; // ID de la categoría seleccionada
  idTarjeta?: string; // ID de la tarjeta corporativa (opcional)
}

