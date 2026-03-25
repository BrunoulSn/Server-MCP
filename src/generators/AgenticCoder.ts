import * as fs from "fs/promises";
import * as path from "path";
import axios from "axios"; // Ou utilize o SDK da Anthropic/OpenAI

export class AgenticCoder {
  private static PENDING_DIR = path.resolve(process.cwd(), "src/dynamic/pending");

  /**
   * Dispara a geração da ferramenta baseada na falha
   */
  static async generate(toolName: string, contextArgs: any): Promise<string> {
    const prompt = this.buildPrompt(toolName, contextArgs);
    
    try {
      console.log(`[AgenticCoder] Solicitando criação da ferramenta: ${toolName}...`);
      
      const generatedCode = await this.callLLM(prompt);
      
      // Garante que o diretório existe
      await fs.mkdir(this.PENDING_DIR, { recursive: true });
      
      const filePath = path.join(this.PENDING_DIR, `${toolName}.ts`);
      await fs.writeFile(filePath, generatedCode, "utf-8");
      
      return filePath;
    } catch (error) {
      console.error("[AgenticCoder] Erro crítico na geração:", error);
      throw error;
    }
  }

  private static async callLLM(prompt: string): Promise<string> {
    // Exemplo genérico usando OpenAI (Adapte para o seu provedor)
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
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

  private static buildPrompt(name: string, args: any): string {
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