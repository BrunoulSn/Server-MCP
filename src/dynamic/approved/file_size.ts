import { z } from "zod";
import fs from "fs/promises";

export default {
  name: "file_size",
  description: "Obtém o tamanho de um arquivo em bytes.",
  inputSchema: z.object({
    filePath: z.string().describe("Caminho completo do arquivo para obter o tamanho")
  }),
  handler: async ({ filePath }: { filePath: string }) => {
    try {
      const stats = await fs.stat(filePath);
      return {
        file: filePath,
        sizeBytes: stats.size,
        sizeKB: Math.round(stats.size / 1024 * 100) / 100,
        sizeMB: Math.round(stats.size / (1024 * 1024) * 100) / 100
      };
    } catch (error: any) {
      return { error: `Erro ao obter tamanho do arquivo: ${error.message}` };
    }
  }
};