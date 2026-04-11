import { z } from "zod";
import fs from "fs/promises";

export default {
  name: "count_lines",
  description: "Conta o número de linhas em um arquivo de código.",
  inputSchema: z.object({
    filePath: z.string().describe("Caminho completo do arquivo para contar linhas")
  }),
  handler: async ({ filePath }: { filePath: string }) => {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      const lineArray = content.split("\n");
      return {
        file: filePath,
        totalLines: lineArray.length,
        nonEmptyLines: lineArray.filter(line => line.trim()).length
      };
    } catch (error: any) {
      return { error: `Erro ao ler arquivo: ${error.message}` };
    }
  }
};