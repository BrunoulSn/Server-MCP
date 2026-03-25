import { z } from "zod";

export default {
  name: "format_json",
  description: "Formata uma string JSON para uma versão legível.",
  inputSchema: z.object({
    jsonString: z.string().describe("String JSON para formatar"),
    indent: z.number().optional().default(2).describe("Número de espaços para indentação")
  }),
  handler: async ({ jsonString, indent }: { jsonString: string, indent: number }) => {
    try {
      const parsed = JSON.parse(jsonString);
      const formatted = JSON.stringify(parsed, null, indent);
      return {
        original: jsonString,
        formatted: formatted
      };
    } catch (error: any) {
      return { error: `Erro ao formatar JSON: ${error.message}` };
    }
  }
};