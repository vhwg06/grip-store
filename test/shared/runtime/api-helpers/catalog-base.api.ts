import { GoBackendClient, type ApiResponse } from "./go-backend.client";

export type JsonRecord = Record<string, unknown>;

export type CatalogMasterKind = "material" | "finish" | "pack";

/**
 * Thin transport adapter for the canonical Catalog Base contract.
 * Business assertions stay in the module step files; this helper only owns
 * paths, authentication headers, and JSON request dispatch.
 */
export class CatalogBaseApi {
  constructor(private readonly client: GoBackendClient) {}

  async adminGet<T = unknown>(token: string, path: string): Promise<ApiResponse<T>> {
    return this.client.get<T>(path, { headers: bearer(token) });
  }

  async adminPost<T = unknown>(token: string, path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.client.post<T>(path, body, { headers: bearer(token) });
  }

  async adminPut<T = unknown>(token: string, path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.client.put<T>(path, body, { headers: bearer(token) });
  }

  async adminPatch<T = unknown>(token: string, path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.client.patch<T>(path, body, { headers: bearer(token) });
  }

  async adminDelete<T = unknown>(token: string, path: string): Promise<ApiResponse<T>> {
    return this.client.delete<T>(path, { headers: bearer(token) });
  }

  async publicGet<T = unknown>(path: string): Promise<ApiResponse<T>> {
    return this.client.get<T>(path);
  }

  async publicPost<T = unknown>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.client.post<T>(path, body);
  }
}

export function catalogBaseApi(client: GoBackendClient): CatalogBaseApi {
  return new CatalogBaseApi(client);
}

export function bearer(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export function record(data: unknown): JsonRecord {
  return data && typeof data === "object" && !Array.isArray(data) ? data as JsonRecord : {};
}

export function entityId(data: unknown): string {
  const value = record(data);
  const nested = record(value.data);
  return String(value.id ?? nested.id ?? "");
}

export function listItems(data: unknown): JsonRecord[] {
  if (Array.isArray(data)) return data.filter(isRecord);
  const value = record(data);
  for (const key of ["items", "data", "categories", "variants", "masters", "definitions"]) {
    if (Array.isArray(value[key])) return value[key].filter(isRecord);
  }
  return [];
}

function isRecord(value: unknown): value is JsonRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
