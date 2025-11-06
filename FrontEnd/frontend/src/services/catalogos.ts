/**
 * Servicios para obtener catálogos (Departamento, Cargo, Empresa).
 */

import { API_BASE_URL } from "../config/constants";
import type { Cargo, Departamento, Empresa } from "../types/catalogos";
import { getValidAccessToken } from "./authService";

/**
 * Obtiene todos los departamentos.
 */
export async function obtenerDepartamentos(): Promise<Departamento[]> {
  const token = await getValidAccessToken();

  if (!token) {
    throw new Error("No hay sesión activa. Por favor inicia sesión.");
  }

  const response = await fetch(`${API_BASE_URL}/departamentos`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "No se pudieron obtener los departamentos.");
  }

  return response.json();
}

/**
 * Obtiene todos los cargos.
 */
export async function obtenerCargos(): Promise<Cargo[]> {
  const token = await getValidAccessToken();

  if (!token) {
    throw new Error("No hay sesión activa. Por favor inicia sesión.");
  }

  const response = await fetch(`${API_BASE_URL}/cargos`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "No se pudieron obtener los cargos.");
  }

  return response.json();
}

/**
 * Obtiene todas las empresas.
 */
export async function obtenerEmpresas(): Promise<Empresa[]> {
  const token = await getValidAccessToken();

  if (!token) {
    throw new Error("No hay sesión activa. Por favor inicia sesión.");
  }

  const response = await fetch(`${API_BASE_URL}/empresas`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "No se pudieron obtener las empresas.");
  }

  return response.json();
}
