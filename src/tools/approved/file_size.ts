import { z } from "zod";
import fs from "fs/promises";

const convertSize = (bytes: number) => ({
  sizeBytes: bytes,
  sizeKB: Math.round(bytes / 1024 * 100) / 100,
  sizeMB: Math.round(bytes / (1024 * 1024) * 100) / 100
});

export default {
  name: "file_size",
  description: "Obtém o tamanho de um arquivo em bytes.",
  inputSchema: z.object({
    filePath: z.string().describe("Caminho completo do arquivo para obter o tamanho")
  }),
  handler: async ({ filePath }: { filePath: string }) => {
    try {
      const { size } = await fs.stat(filePath);
      return { file: filePath, ...convertSize(size) };
    } catch (error: any) {
      return { error: `Erro ao obter tamanho do arquivo: ${error.message}` };
    }
  }
};