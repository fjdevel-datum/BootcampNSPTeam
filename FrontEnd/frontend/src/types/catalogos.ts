/**
 * Tipos para entidades de catálogo (Departamento, Cargo, Empresa).
 */

export interface Departamento {
  idDepartamento: number;
  nombreDepart: string;
  descripcion?: string;
}

export interface Cargo {
  idCargo: number;
  nombre: string;
  descripcion?: string;
}

export interface Empresa {
  idEmpresa: number;
  nombreEmpresa: string;
  numRegistroTributario: string;
  nrc?: string;
  pais?: {
    idPais: number;
    nombrePais: string;
  };
}
