"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgenticCoder = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const axios_1 = __importDefault(require("axios")); // Ou utilize o SDK da Anthropic/OpenAI
class AgenticCoder {
    static PENDING_DIR = path.resolve(process.cwd(), "src/dynamic/pending");
    /**
     * Dispara a geração da ferramenta baseada na falha
     */
    static async generate(toolName, contextArgs) {
        const prompt = this.buildPrompt(toolName, contextArgs);
        try {
            console.log(`[AgenticCoder] Solicitando criação da ferramenta: ${toolName}...`);
            const generatedCode = await this.callLLM(prompt);
            // Garante que o diretório existe
            await fs.mkdir(this.PENDING_DIR, { recursive: true });
            const filePath = path.join(this.PENDING_DIR, `${toolName}.ts`);
            await fs.writeFile(filePath, generatedCode, "utf-8");
            return filePath;
        }
        catch (error) {
            console.error("[AgenticCoder] Erro crítico na geração:", error);
            throw error;
        }
    }
    static async callLLM(prompt) {
        // Exemplo genérico usando OpenAI (Adapte para o seu provedor)
        const response = await axios_1.default.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-4-turbo",
            messages: [{ role: "system", content: prompt }],
            temperature: 0.1, // Baixa temperatura para código determinístico
        }, {
            headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` }
        });
        const rawCode = response.data.choices[0].message.content;
        // Cleanup de Markdown (remove ```typescript e ```)
        return rawCode.replace(/```typescript|```/g, "").trim();
    }
    static buildPrompt(name, args) {
        return `Você é um Arquiteto de Software. Escreva uma DynamicTool MCP em TypeScript.
    NOME: ${name}
    CONTEXTO DE USO: ${JSON.stringify(args)}
    
    REGRAS:
    - Use 'import { z } from "zod";' para schemas.
    - Exporte 'export default { ... }'.
    - Libs permitidas: axios, zod, cheerio.
    - O handler deve ser assíncrono.
    - Se a ferramenta exigir API Keys, use 'process.env.VAR_NAME'.`;
    }
}
exports.AgenticCoder = AgenticCoder;
