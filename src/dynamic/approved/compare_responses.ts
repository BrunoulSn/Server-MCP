import { z } from "zod";

function getFields(obj: any, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [];
  const fields: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    fields.push(fullKey);
    if (typeof value === "object" && value !== null) {
      fields.push(...getFields(value, fullKey));
    }
  }
  return fields;
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
      const responses = [];
      for (const payload of payloads) {
        try {
          const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json", ...headers },
            body: payload
          });
          const body = await response.json();
          responses.push({ status: response.status, body });
        } catch (error) {
            let message: string;
            if (error instanceof Error) 
                message = error.message;
            else
                message = "Unknown error";
          responses.push({ status: 0, body: null, error: message});
        }
      }

      const allFields = new Set<string>();
      const fieldCounts: Record<string, number> = {};
      const fieldTypes: Record<string, Set<string>> = {};

      responses.forEach(({ body }) => {
        if (body) {
          const fields = getFields(body);
          fields.forEach(field => {
            allFields.add(field);
            fieldCounts[field] = (fieldCounts[field] || 0) + 1;
            const type = typeof body[field.split(".").reduce((o, k) => o?.[k], body)];
            if (!fieldTypes[field]) fieldTypes[field] = new Set();
            fieldTypes[field].add(type);
          });
        }
      });

      const total = responses.length;
      const commonFields = Array.from(allFields).filter(f => fieldCounts[f] === total);
      const inconsistentFields = Array.from(allFields).filter(f => fieldTypes[f].size > 1);
      const optionalFields = Array.from(allFields).filter(f => fieldCounts[f] < total);

      console.error(`[compare_responses] Comparação de ${total} respostas`);

      return {
        commonFields,
        inconsistentFields,
        optionalFields,
        responses
      };
    } catch (error) {
        let message: string;
        if (error instanceof Error)
            message = error.message;
        else
            message = "Unknown error";
      console.error(`[compare_responses] Erro: ${message}`);
      return {
        commonFields: [],
        inconsistentFields: [],
        optionalFields: [],
        responses: [],
        error: message
      };
    }
  }
};