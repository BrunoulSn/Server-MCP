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
    
    console.log(`[AgenticCoder] Solicitando criação da ferramenta: ${toolName}...`);
    
    const generatedCode = await this.callLLM(prompt);
    await fs.mkdir(this.PENDING_DIR, { recursive: true });
    
    const filePath = path.join(this.PENDING_DIR, `${toolName}.ts`);
    await fs.writeFile(filePath, generatedCode, "utf-8");
    
    return filePath;
  }

  private static async callLLM(prompt: string): Promise<string> {
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-4-turbo",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.1,
    }, {
      headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` }
    });

    const rawCode = response.data.choices[0].message.content;
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