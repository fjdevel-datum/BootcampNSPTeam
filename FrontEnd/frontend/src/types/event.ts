// ═══════════════════════════════════════════════════════════════════════
// Tipos para integración con Backend
// ═══════════════════════════════════════════════════════════════════════

/**
 * Respuesta del backend para un evento
 * Corresponde a EventoResponse.java
 */
export interface EventoBackend {
  idEvento: number;
  idEmpleado: number;
  nombreEvento: string;
  fechaRegistro: string; // Formato: dd/MM/yyyy (ej: 21/01/2025)
  estado: string; // "activo" | "completado" | "cancelado"
  nombreEmpleado: string;
}

// ═══════════════════════════════════════════════════════════════════════
// Tipos para UI (legacy - mantener compatibilidad)
// ═══════════════════════════════════════════════════════════════════════

// Interfaces básicas para manejo de eventos (sin backend)
export interface EventData {
  name: string;
  colorClass: string;
  financialData: {
    totalReceived: number;
    totalSpent: number;
    remaining: number;
    currency: string;
  };
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category?: string;
}

// Datos mock por defecto para cualquier evento
export const defaultEventData: Omit<EventData, 'name' | 'colorClass'> = {
  financialData: {
    totalReceived: 0,
    totalSpent: 0,
    remaining: 0,
    currency: 'USD'
  },
  transactions: []
};