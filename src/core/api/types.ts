// ─── HTTP ────────────────────────────────────────────────────────────────────

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type HttpStatus = number;

/**
 * Espelha exatamente os valores que o operador `typeof` pode retornar.
 * Usado em InconsistentField para garantir compatibilidade com type predicates.
 */
export type JavaScriptType =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'symbol'
  | 'undefined'
  | 'object'
  | 'function';

// ─── ProbeResult ─────────────────────────────────────────────────────────────

export interface ProbeResult {
  url: string;
  method: HttpMethod;
  status: HttpStatus;
  ok: boolean;
  latencyMs: number;
  body: unknown;
  headers: Record<string, string>;
  error?: string;
}

// ─── EndpointDiscovery ───────────────────────────────────────────────────────

export interface DiscoveredEndpoint {
  path: string;
  status: HttpStatus;
  latencyMs: number;
}

export interface EndpointDiscoveryResult {
  baseUrl: string;
  found: DiscoveredEndpoint[];
  total: number;
  error?: string;
}

// ─── ResponseComparator ──────────────────────────────────────────────────────

export interface InconsistentField {
  field: string;
  types: JavaScriptType[];
}

export interface ComparatorResponse {
  status: HttpStatus;
  body: unknown;
}

export interface CompareResult {
  url: string;
  commonFields: string[];
  optionalFields: string[];
  inconsistentFields: InconsistentField[];
  responses: ComparatorResponse[];
  error?: string;
}

// ─── Options ─────────────────────────────────────────────────────────────────

export interface ApiProberOptions {
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
}

export interface EndpointDiscovererOptions {
  customPaths?: string[];
  method?: HttpMethod;
}