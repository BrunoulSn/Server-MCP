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
      const formatted = JSON.stringify(JSON.parse(jsonString), null, indent);
      return { original: jsonString, formatted };
    } catch (error: any) {
      return { error: `Erro ao formatar JSON: ${error.message}` };
    }
  }
};