"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolRegistry = void 0;

class ToolRegistry {
    static instance;
    tools = new Map();
    constructor() {
        if (ToolRegistry.instance)
            return ToolRegistry.instance;
        ToolRegistry.instance = this;
    }
    register(tool) {
        // Validação básica de integridade antes do registro
        if (!tool.name || typeof tool.handler !== 'function') {
            throw new Error(`Tool inválida tentou ser registrada: ${tool.name}`);
        }
        this.tools.set(tool.name, tool);
        console.log(`[Registry] Tool '${tool.name}' registrada/atualizada.`);
    }
    getTool(name) {
        return this.tools.get(name);
    }
    getAllTools() {
        return Array.from(this.tools.values());
    }
    unregister(name) {
        this.tools.delete(name);
    }
}
exports.ToolRegistry = ToolRegistry;
