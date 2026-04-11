import * as chokidar from "chokidar";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { ToolRegistry } from "./ToolRegistry.js";

const pathTools = '../tools/approved';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ToolLoader {
  constructor(private registry: ToolRegistry) { }

  async loadAll(): Promise<void> {
    const approvedDir = path.resolve(__dirname, pathTools);

    if (!fs.existsSync(approvedDir))
      return console.error(`[Loader] Diretório não encontrado: ${approvedDir}`);

    const files = fs.readdirSync(approvedDir).filter(f => f.endsWith(".js"));

    if (files.length === 0)
      return console.error(`[Loader] Nenhuma tool encontrada em: ${approvedDir}`);

    const results = await Promise.allSettled(
      files.map(f => this.loadTool(path.join(approvedDir, f)))
    );

    const failed = results.filter(r => r.status === "rejected").length;
    console.error(`[Loader] ${files.length - failed}/${files.length} tools carregadas.`);
  }

  watch() {
    const approvedDir = path.resolve(__dirname, pathTools);

    const watcher = chokidar.watch(`${approvedDir}/*.js`, {
      ignoreInitial: true
    });

    watcher.on("add", async (filePath) => {
      console.error(`[Watcher] Novo arquivo detectado: ${filePath}`);
      await this.loadTool(filePath);
    });

    watcher.on("change", async (filePath) => {
      console.error(`[Watcher] Arquivo alterado: ${filePath}`);
      await this.loadTool(filePath);
    });

    watcher.on("unlink", (filePath) => {
      const name = path.basename(filePath, ".ts"); // ← era ".js"
      this.registry.unregister(name);
    });
  }

  private async loadTool(filePath: string) {
    try {
      const module = await import(`file://${filePath}?update=${Date.now()}`);
      const tool = module.default;

      if (this.isValidTool(tool)) {
        this.registry.register(tool);
        console.error(`[Loader] Tool registrada: ${tool.name}`);
      } else {
        console.error(`[Loader] Arquivo ignorado (export default inválido): ${filePath}`);
      }
    } catch (err) {
      console.error(`[Error] Falha ao carregar ${filePath}:`, err);
    }
  }

  private isValidTool(obj: any): boolean {
    if (!obj) return false;
    if (typeof obj.name !== "string") return false;
    if (typeof obj.description !== "string") return false;
    if (typeof obj.handler !== "function") return false;
    if (obj.inputSchema == null) return false;
    return true;
  }
}