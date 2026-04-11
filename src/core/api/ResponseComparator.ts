import { CompareResult, ComparatorResponse, InconsistentField, JavaScriptType } from './types.js';

export class ResponseComparator {
  async compare(
    url: string,
    payloads: string[],
    method: 'POST' | 'PUT' | 'PATCH' = 'POST',
    headers: Record<string, string> = {}
  ): Promise<CompareResult> {
    try {
      const responses: ComparatorResponse[] = await Promise.all(
        payloads.map(async (body) => {
          const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', ...headers },
            body,
          });
          const parsed = await res.json().catch(() => null);
          return { status: res.status, body: parsed };
        })
      );

      const validBodies = responses
        .map((r) => r.body)
        .filter((b): b is Record<string, unknown> =>
          b !== null && typeof b === 'object' && !Array.isArray(b)
        );

      if (validBodies.length === 0) {
        return { url, commonFields: [], optionalFields: [], inconsistentFields: [], responses };
      }

      const allKeys = [...new Set(validBodies.flatMap(Object.keys))];

      const commonFields = allKeys.filter((key) =>
        validBodies.every((b) => key in b)
      );

      const optionalFields = allKeys.filter((key) =>
        !validBodies.every((b) => key in b)
      );

      const inconsistentFields = allKeys
        .map((key): InconsistentField | null => {
          const types = [...new Set(validBodies.map((b) => typeof b[key] as JavaScriptType))];
          return types.length > 1 ? { field: key, types } : null;
        })
        .filter((f): f is InconsistentField => f !== null);

      return { url, commonFields, optionalFields, inconsistentFields, responses };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { url, commonFields: [], optionalFields: [], inconsistentFields: [], responses: [], error: message };
    }
  }
}