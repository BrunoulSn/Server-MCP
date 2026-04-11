import { z } from "zod";
import fs from "fs/promises";

export default {
  name: "analyze_dev_code",
  description: "Analisa um arquivo local em busca de débitos técnicos, falta de tipos e riscos de segurança.",
  inputSchema: z.object({
    filePath: z.string().describe("Caminho completo do arquivo para análise"),
    focus: z.enum(["performance", "security", "types"]).optional().default("types")
  }),
  handler: async ({ filePath, focus }: { filePath: string, focus: string }) => {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      
      const checks = [
        { condition: content.includes(": any") || content.includes("as any"), message: "🔴 [TYPES]: Uso de 'any' detectado. Isso quebra a segurança do TypeScript." },
        { condition: /(key|password|secret|token)\s*=\s*['"`][^'"`]{5,}/gi.test(content), message: "🚨 [SECURITY]: Possível segredo (API Key/Password) exposto no código!" },
        { condition: content.includes("catch") && !content.includes("console.error") && !content.includes("logger"), message: "⚠️ [ROBUSTNESS]: Bloco catch detectado sem log ou tratamento de erro adequado." },
        { condition: focus === "performance" && content.includes(".map(") && content.includes(".filter("), message: "🟡 [PERF]: Múltiplas iterações encadeadas. Considere usar um loop único para grandes datasets." }
      ];

      const reports = checks.filter(c => c.condition).map(c => c.message);

      return {
        file: filePath,
        analysis: reports.length > 0 ? reports : ["✅ Código parece seguir as boas práticas iniciais."],
        linesAnalyzed: content.split("\n").length
      };
    } catch (error: any) {
      return { error: `Erro ao ler arquivo: ${error.message}` };
    }
  }
};