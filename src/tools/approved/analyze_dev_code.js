"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const promises_1 = __importDefault(require("fs/promises"));
exports.default = {
    name: "analyze_dev_code",
    description: "Analisa um arquivo local em busca de débitos técnicos, falta de tipos e riscos de segurança.",
    inputSchema: zod_1.z.object({
        filePath: zod_1.z.string().describe("Caminho completo do arquivo para análise"),
        focus: zod_1.z.enum(["performance", "security", "types"]).optional().default("types")
    }),
    handler: async ({ filePath, focus }) => {
        try {
            const content = await promises_1.default.readFile(filePath, "utf-8");
            const reports = [];
            // 1. Verificação de Tipagem (Anti-Pattern: any)
            if (content.includes(": any") || content.includes("as any")) {
                reports.push("🔴 [TYPES]: Uso de 'any' detectado. Isso quebra a segurança do TypeScript.");
            }
            // 2. Verificação de Segurança (Hardcoded secrets)
            if (content.match(/(key|password|secret|token)\s*=\s*['"`][^'"`]{5,}/gi)) {
                reports.push("🚨 [SECURITY]: Possível segredo (API Key/Password) exposto no código!");
            }
            // 3. Verificação de Tratamento de Erro
            if (content.includes("catch") && !content.includes("console.error") && !content.includes("logger")) {
                reports.push("⚠️ [ROBUSTNESS]: Bloco catch detectado sem log ou tratamento de erro adequado.");
            }
            // 4. Verificação de Performance (Loops pesados)
            if (focus === "performance" && content.includes(".map(") && content.includes(".filter(")) {
                reports.push("🟡 [PERF]: Múltiplas iterações encadeadas. Considere usar um loop único para grandes datasets.");
            }
            return {
                file: filePath,
                analysis: reports.length > 0 ? reports : ["✅ Código parece seguir as boas práticas iniciais."],
                linesAnalyzed: content.split("\n").length
            };
        }
        catch (error) {
            return { error: `Erro ao ler arquivo: ${error.message}` };
        }
    }
};
