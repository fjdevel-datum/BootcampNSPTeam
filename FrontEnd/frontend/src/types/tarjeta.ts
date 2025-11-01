/**
 * Types para el módulo de tarjetas corporativas
 */

export interface EmpleadoTarjeta {
  idEmpleado: number;
  nombre: string;
  apellido: string;
  correo: string;
}

export interface Tarjeta {
  idTarjeta: number;
  banco: string;
  numeroTarjeta: string;
  fechaExpiracion: string; // ISO date string
  idPais: number;
  nombrePais: string;
  empleado: EmpleadoTarjeta | null;
}

export interface TarjetaRequest {
  banco: string;
  numeroTarjeta: string;
  fechaExpiracion: string; // YYYY-MM-DD
  idPais: number;
  idEmpleado?: number | null;
}

export interface AsignarTarjetaRequest {
  idTarjeta: number;
  idEmpleado: number;
}

// Helper para determinar el tipo de tarjeta basado en el número
export function getTipoTarjeta(numeroTarjeta: string): "visa" | "mastercard" | "other" {
  const numero = numeroTarjeta.replace(/[-\s]/g, "");
  
  if (numero.startsWith("4")) {
    return "visa";
  } else if (/^5[1-5]/.test(numero)) {
    return "mastercard";
  }
  
  return "other";
}

// Helper para formatear número de tarjeta (agregar guiones cada 4 dígitos)
export function formatearNumeroTarjeta(numero: string): string {
  const limpio = numero.replace(/[-\s]/g, "");
  return limpio.replace(/(.{4})/g, "$1-").replace(/-$/, "");
}

// Helper para obtener nombre completo del empleado
export function getNombreCompletoEmpleado(empleado: EmpleadoTarjeta | null): string {
  if (!empleado) return "Sin asignar";
  return `${empleado.nombre} ${empleado.apellido}`;
}
