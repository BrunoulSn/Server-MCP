import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {  CallToolRequestSchema,  InitializeRequestSchema,  ListToolsRequestSchema} from "@modelcontextprotocol/sdk/types.js";import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";
import { ToolRegistry } from "./core/ToolRegistry.js";
import { ToolLoader } from "./core/toolLoader.js";
import { AgenticCoder } from "./generators/AgenticCoder.js";

const registry = new ToolRegistry();
const loader = new ToolLoader(registry);

// Adicionar uma tool simples para teste
const testTool = {
  name: "hello_world",
  description: "Retorna uma mensagem de teste 'Hello World'",
  inputSchema: z.object({}),
  handler: async () => {
    return { message: "Hello World from MCP Server!" };
  }
};

registry.register(testTool);

const server = new Server(
  {
    name: "server TCS",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

server.setRequestHandler(InitializeRequestSchema, async () => {
  console.error("[Initialize] Servidor inicializado");
  return {
    protocolVersion: "2024-11-05",
    capabilities: { tools: {} },
    serverInfo: { name: "meta-server", version: "1.0.0" }
  };
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = registry.getAllTools().map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: zodToJsonSchema(t.inputSchema)
  }));
  console.error(`[ListTools] Tools disponíveis: ${tools.map(t => t.name).join(', ')}`);
  return {
    tools
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  console.error(`[Call] Tool chamada: ${name}`);

  const tool = registry.getTool(name);

  if (!tool) {
    try {
      const prototypePath = await AgenticCoder.generate(name, args);
      return {
        content: [{ type: "text", text: `Tool '${name}' não encontrada. Protótipo gerado em: ${prototypePath}` }],
        isError: true
      };
    } catch (err: any) {
      return {
        content: [{ type: "text", text: `Tool '${name}' não encontrada e falha ao gerar protótipo: ${err?.message}` }],
        isError: true
      };
    }
  }

  try {
    const result = await tool.handler(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }]
    };
  } catch (error: any) {
    console.error("[Error] Falha na execução:", error);
    return {
      content: [{ type: "text", text: `Erro na execução: ${error?.message || "unknown"}` }],
      isError: true
    };
  }
});

async function main() {
  console.error("Starting MCP server...");

  await loader.loadAll();
  loader.watch();

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("MCP server connected and running.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

//import { InitializeRequestSchema } from "@modelcontextprotocol/sdk/types.js";

server.setRequestHandler(InitializeRequestSchema, async () => {
  return {
    protocolVersion: "2024-11-05",
    capabilities: { tools: {} },
    serverInfo: { name: "meta-server", version: "1.0.0" }
  };
});