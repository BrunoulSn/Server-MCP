import { z } from "zod";
import fs from "fs/promises";

export default {
  name: "file_exists",
  description: "Verifica se um arquivo existe no sistema de arquivos.",
  inputSchema: z.object({
    filePath: z.string().describe("Caminho completo do arquivo para verificar")
  }),
  handler: async ({ filePath }: { filePath: string }) => {
    try {
      await fs.access(filePath);
      return {
        file: filePath,
        exists: true
      };
    } catch {
      return {
        file: filePath,
        exists: false
      };
    }
  }
};