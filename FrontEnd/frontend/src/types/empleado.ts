/**
 * Tipos relacionados con la gestion de empleados/usuarios.
 */

export interface EmpleadoResponse {
  idEmpleado: number;
  idDepartamento: number;
  idCargo: number;
  idEmpresa: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string | null;
  usuario: string;
  keycloakId: string;
}

export interface CrearEmpleadoPayload {
  idDepartamento: number;
  idCargo: number;
  idEmpresa: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  usuario: string;
  contrasena: string;
}
