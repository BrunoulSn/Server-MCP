import { z } from "zod";

export interface DynamicTool {
  name: string;
  description: string;
  inputSchema: any; // Zod Schema
  handler: (args: any) => Promise<any>;
}

export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools: Map<string, DynamicTool> = new Map();

  constructor() {
    if (ToolRegistry.instance) return ToolRegistry.instance;
    ToolRegistry.instance = this;
  }

public register(tool: DynamicTool): void {
  if (!tool.name || typeof tool.handler !== 'function') {
    throw new Error(`Tool inválida tentou ser registrada: ${tool.name}`);
  }
  this.tools.set(tool.name, tool);
  console.error(`[Registry] Tool '${tool.name}' registrada/atualizada.`);
}

  public getTool(name: string): DynamicTool | undefined {
    return this.tools.get(name);
  }

  public getAllTools(): DynamicTool[] {
    return Array.from(this.tools.values());
  }

  public unregister(name: string): void {
    this.tools.delete(name);
  }
}