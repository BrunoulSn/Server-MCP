import { z } from "zod";
import fs from "fs/promises";
import path from "path";

export default {
  name: "save_contract",
  description: "Salva um contrato gerado em disco no diretório que o usuário especificar.",
  inputSchema: z.object({
    content: z.string().describe("Conteúdo a ser salvo"),
    filename: z.string().describe("Nome do arquivo sem extensão"),
    dirPath: z.string().describe("Caminho do diretório"),
    format: z.enum(["json", "yaml", "ts"]).describe("Formato do arquivo")
  }),
  handler: async ({ content, filename, dirPath, format }: { content: string, filename: string, dirPath: string, format: string }) => {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      const ext = format === "ts" ? "ts" : format;
      const filePath = path.join(dirPath, `${filename}.${ext}`);
      await fs.writeFile(filePath, content, "utf-8");
      const stats = await fs.stat(filePath);

      console.error(`[save_contract] Arquivo salvo: ${filePath} (${stats.size} bytes)`);

      return {
        savedPath: filePath,
        sizeBytes: stats.size,
        format
      };
    } catch (error) {
      console.error(`[save_contract] Erro ao salvar: ${error.message}`);
      return {
        savedPath: "",
        sizeBytes: 0,
        format,
        error: error.message
      };
    }
  }
};