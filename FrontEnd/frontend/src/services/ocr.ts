import type { GastoFormData } from "../types/gasto";

const DEFAULT_BACKEND_PREFIX = "/api";
const backendBaseUrl = (() => {
  const url = import.meta.env.VITE_BACKEND_URL as string | undefined;
  if (!url || typeof url !== "string") {
    return DEFAULT_BACKEND_PREFIX;
  }
  const trimmed = url.trim();
  if (!trimmed) {
    return DEFAULT_BACKEND_PREFIX;
  }
  return trimmed.replace(/\/+$/, "");
})();
const backendIsAbsolute = /^https?:\/\//i.test(backendBaseUrl);

export interface OcrAnalysisResponse {
  ocrResult: string;
  extractedText: string;
  llmResponse: string;
}

export interface LlmParseResult {
  formData: GastoFormData;
  rawJson: Record<string, unknown> | null;
  cleanedJsonString: string;
  error?: string;
}

const CURLY_BLOCK_REGEX = /\{[\s\S]*\}/m;
const DEFAULT_FILE_NAME = "captura-gasto.jpg";

function resolveBackendPath(path: string) {
  const normalizedPath = path ? (path.startsWith("/") ? path : `/${path}`) : "/";

  if (!backendBaseUrl) {
    return normalizedPath;
  }

  if (backendIsAbsolute) {
    return `${backendBaseUrl}${normalizedPath}`;
  }

  if (backendBaseUrl === "/") {
    return normalizedPath;
  }

  return `${backendBaseUrl}${normalizedPath}`.replace(/\/{2,}/g, "/");
}

/**
 * Call the Quarkus OCR endpoint with the provided file.
 */
export async function analyzeExpenseImage(file: File): Promise<OcrAnalysisResponse> {
  const form = new FormData();
  form.append("file", file, file.name || DEFAULT_FILE_NAME);
  form.append("filename", file.name || DEFAULT_FILE_NAME);
  form.append("contentType", file.type || "application/octet-stream");

  const response = await fetch(resolveBackendPath("/ocr"), {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const message = await safeReadText(response);
    throw new Error(
      `Error ${response.status} procesando la imagen con el OCR: ${message || "sin detalle"}`
    );
  }

  return (await response.json()) as OcrAnalysisResponse;
}

/**
 * Send the LLM JSON payload to persist the gasto in the backend.
 */
export async function saveGastoFromLlm(payload: Record<string, unknown>) {
  const response = await fetch(resolveBackendPath("/gastos/llm"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await safeReadText(response);
    throw new Error(
      `No se pudo guardar el gasto en el backend (status ${response.status}): ${message || "sin detalle"}`
    );
  }

  return (await response.json()) as { id: number; id_gasto: number; idGasto: number };
}

/**
 * Upload the original image file once the gasto has been created.
 */
export async function uploadGastoFile(gastoId: number, file: File) {
  const form = new FormData();
  form.append("file", file, file.name || DEFAULT_FILE_NAME);
  form.append("filename", file.name || DEFAULT_FILE_NAME);
  form.append("contentType", file.type || "application/octet-stream");

  const response = await fetch(resolveBackendPath(`/gastos/${gastoId}/archivo`), {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const message = await safeReadText(response);
    throw new Error(
      `El gasto se creo pero fallo la carga del archivo (status ${response.status}): ${message || "sin detalle"}`
    );
  }

  return response.json() as Promise<{
    id: number;
    blobName: string;
    blobUrl: string;
    fileSize: number;
    contentType: string;
  }>;
}

/**
 * Parse and normalize the LLM response string so it can be used as form defaults.
 */
export function parseLlmResponse(llmResponse: string | null | undefined): LlmParseResult {
  let rawContent = typeof llmResponse === "string" ? llmResponse.trim() : "";
  let parsed: Record<string, unknown> | null = null;
  let parsingError: string | undefined;

  if (rawContent) {
    parsed = attemptJsonParse(rawContent);
    if (!parsed) {
      const match = rawContent.match(CURLY_BLOCK_REGEX);
      if (match) {
        rawContent = match[0];
        parsed = attemptJsonParse(rawContent);
      }
    }

    if (!parsed) {
      parsingError = "No se pudo interpretar la respuesta del LLM como JSON.";
    }
  } else {
    parsingError = "El LLM no devolvio contenido.";
  }

  const formData = mapToFormData(parsed);
  const cleanedJsonString = parsed
    ? JSON.stringify(parsed)
    : JSON.stringify(buildPayloadFromFormData(formData));

  return {
    formData,
    rawJson: parsed,
    cleanedJsonString,
    error: parsingError,
  };
}

/**
 * Build the payload (same structure expected by the backend) using the final form values.
 */
export function buildPayloadFromFormData(formData: GastoFormData) {
  return {
    NombreEmpresa: formData.nombreEmpresa,
    Descripcion: formData.descripcion,
    MontoTotal: formData.montoTotal,
    Fecha: formData.fecha,
  };
}

/**
 * Utility to convert a base64 data URL into a File object.
 */
export async function dataUrlToFile(dataUrl: string, fileName = DEFAULT_FILE_NAME) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: blob.type || "image/jpeg" });
}

function attemptJsonParse(content: string) {
  try {
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function mapToFormData(parsed: Record<string, unknown> | null): GastoFormData {
  if (!parsed) {
    return {
      nombreEmpresa: "",
      descripcion: "",
      montoTotal: "",
      fecha: "",
    };
  }

  return {
    nombreEmpresa: pickString(parsed, [
      "NombreEmpresa",
      "Nombre Empresa",
      "Nombre de la empresa",
      "nombreEmpresa",
    ]),
    descripcion: pickString(parsed, ["Descripcion", "Descripci\u00f3n", "descripcion"]),
    montoTotal: normalizeAmount(pick(parsed, ["MontoTotal", "Monto Total", "montoTotal"])),
    fecha: normalizeDate(pick(parsed, ["Fecha", "fecha"])),
  };
}

function normalizeAmount(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toFixed(2);
  }

  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const cleaned = trimmed.replace(/[^\d,.-]/g, "");
  if (!cleaned) {
    return "";
  }

  const decimalSeparatorIsComma = cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".");
  let normalized = cleaned;

  if (decimalSeparatorIsComma) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = cleaned.replace(/,/g, "");
  }

  const numeric = Number.parseFloat(normalized);
  if (!Number.isFinite(numeric)) {
    return "";
  }

  return numeric.toFixed(2);
}

function normalizeDate(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const cleaned = trimmed.split(/[ T]/)[0]; // Soporta formatos con hora

  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  const dmyMatch = cleaned.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{2,4})$/);
  if (dmyMatch) {
    const [, dd, mm, yy] = dmyMatch;
    const year = yy.length === 2 ? `20${yy}` : yy.padStart(4, "20");
    return `${year}-${mm}-${dd}`;
  }

  return "";
}

function pick(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (key in source) {
      return source[key];
    }
  }
  return undefined;
}

function pickString(source: Record<string, unknown>, keys: string[]) {
  const value = pick(source, keys);
  return typeof value === "string" ? value.trim() : "";
}

async function safeReadText(response: Response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}
