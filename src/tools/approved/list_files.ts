import { z } from "zod";
import fs from "fs/promises";
import path from "path";

export default {
  name: "list_files",
  description: "Lista os arquivos em um diretório.",
  inputSchema: z.object({
    dirPath: z.string().describe("Caminho completo do diretório para listar arquivos"),
    recursive: z.boolean().optional().default(false).describe("Se deve listar recursivamente subdiretórios")
  }),
  handler: async ({ dirPath, recursive }: { dirPath: string, recursive: boolean }) => {
    try {
      const files = recursive ? await getFilesRecursive(dirPath) : await fs.readdir(dirPath);
      return { directory: dirPath, files, count: files.length };
    } catch (error: any) {
      return { error: `Erro ao listar diretório: ${error.message}` };
    }
  }
};

async function getFilesRecursive(dir: string): Promise<string[]> {
  const items = await fs.readdir(dir);
  const results: string[] = [];

  await Promise.all(items.map(async (item) => {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory()) {
      const nested = await getFilesRecursive(fullPath);
      results.push(...nested);
    } else {
      results.push(fullPath);
    }
  }));

  return results;
}