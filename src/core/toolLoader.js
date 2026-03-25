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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolLoader = void 0;
const chokidar = __importStar(require("chokidar"));
const path = __importStar(require("path"));
class ToolLoader {
    registry;
    constructor(registry) {
        this.registry = registry;
    }
    watch() {
        const approvedDir = path.resolve(process.cwd(), "src/dynamic/approved");
        chokidar.watch(`${approvedDir}/*.ts`).on("add", async (filePath) => {
            await this.loadTool(filePath);
        });
    }
    async loadTool(filePath) {
        try {
            // Forçamos o import dinâmico ignorando o cache via query string (se necessário no ESM)
            const module = await import(`file://${filePath}?update=${Date.now()}`);
            const tool = module.default;
            if (this.isValidTool(tool)) {
                this.registry.register(tool);
                console.log(`[Hot-Reload] Tool registrada com sucesso: ${tool.name}`);
            }
        }
        catch (err) {
            console.error(`[Error] Falha ao carregar tool em ${filePath}:`, err);
        }
    }
    isValidTool(obj) {
        return obj && obj.name && obj.handler && obj.inputSchema;
    }
}
exports.ToolLoader = ToolLoader;
