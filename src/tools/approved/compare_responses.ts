import { z } from "zod";

function getFields(obj: any, prefix = ""): string[] {
  if (!obj || typeof obj !== "object") return [];
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const nested = typeof value === "object" && value !== null ? getFields(value, fullKey) : [];
    return [fullKey, ...nested];
  });
}

export default {
  name: "compare_responses",
  description: "Chama o mesmo endpoint com múltiplos payloads e compara as respostas para identificar campos inconsistentes, tipos variáveis e campos opcionais.",
  inputSchema: z.object({
    url: z.string().url().describe("URL do endpoint"),
    method: z.string().default("POST").describe("Método HTTP"),
    payloads: z.array(z.string()).describe("Array de payloads JSON"),
    headers: z.record(z.string()).optional().describe("Cabeçalhos HTTP opcionais")
  }),
  handler: async ({ url, method, payloads, headers = {} }: { url: string, method: string, payloads: string[], headers?: Record<string, string> }) => {
    try {
      const responses = await Promise.all(payloads.map(payload =>
        fetch(url, {
          method,
          headers: { "Content-Type": "application/json", ...headers },
          body: payload
        })
          .then(r => r.json().then(body => ({ status: r.status, body })))
          .catch(error => ({ status: 0, body: null, error: error instanceof Error ? error.message : "Unknown error" }))
      ));

      const allFields = new Set<string>();
      const fieldCounts: Record<string, number> = {};
      const fieldTypes: Record<string, Set<string>> = {};

      responses.forEach(({ body }) => {
        if (body) {
          getFields(body).forEach(field => {
            allFields.add(field);
            fieldCounts[field] = (fieldCounts[field] ?? 0) + 1;
            const value = field.split(".").reduce((o, k) => o?.[k], body);
            if (!fieldTypes[field]) fieldTypes[field] = new Set();
            fieldTypes[field].add(typeof value);
          });
        }
      });

      const total = responses.length;
      return {
        commonFields: Array.from(allFields).filter(f => fieldCounts[f] === total),
        inconsistentFields: Array.from(allFields).filter(f => fieldTypes[f].size > 1),
        optionalFields: Array.from(allFields).filter(f => fieldCounts[f] < total),
        responses
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`[compare_responses] Erro: ${message}`);
      return { commonFields: [], inconsistentFields: [], optionalFields: [], responses: [], error: message };
    }
  }
};