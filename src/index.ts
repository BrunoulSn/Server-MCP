import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ToolRegistry } from "./core/ToolRegistry.js";
import { ToolLoader } from "./core/toolLoader.js";
export { ApiProber } from './core/api/ApiProber.js';
export { EndpointDiscoverer } from './core/api/EndpointDiscoverer.js';
export { ResponseComparator } from './core/api/ResponseComparator.js';
export type {
  HttpMethod,
  HttpStatus,
  JavaScriptType,
  ProbeResult,
  DiscoveredEndpoint,
  EndpointDiscoveryResult,
  InconsistentField,
  ComparatorResponse,
  CompareResult,
  ApiProberOptions,
  EndpointDiscovererOptions,
} from './core/api/types.js';

const registry = new ToolRegistry();
const loader = new ToolLoader(registry);

const server = new McpServer({
  name: "server TCS",
  version: "1.0.0"
});

async function registerDynamicTools() {
  const tools = registry.getAllTools();

  for (const tool of tools) {
    const shape = tool.inputSchema?.shape ?? {};

    const handler = async (args: any) => {
      try {
        const result = await tool.handler(args);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: "text" as const, text: `Erro: ${error?.message ?? "desconhecido"}` }],
          isError: true as const
        };
      }
    };

    server.tool(tool.name, tool.description, shape, handler);
  }

  console.error(`[Server] ${tools.length} ferramentas registradas no McpServer.`);
}

async function main() {
  console.error("Starting MCP server...");

  await loader.loadAll();
  loader.watch();

  await registerDynamicTools();

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("MCP server connected and running.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});