"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const ToolRegistry_js_1 = require("./core/ToolRegistry.js");
const AgenticCoder_js_1 = require("./generators/AgenticCoder.js");
const registry = new ToolRegistry_js_1.ToolRegistry();
const server = new index_js_1.Server({ name: "meta-server", version: "1.0.0" }, { capabilities: { tools: {} } });
// Handler para listar ferramentas (incluindo as dinâmicas)
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
    tools: registry.getAllTools().map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema
    }))
}));
// Interceptor de Chamadas
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = registry.getTool(name);
    if (!tool) {
        // DISPARO DO FLUXO DE GERAÇÃO
        const prototypePath = await AgenticCoder_js_1.AgenticCoder.generate(name, args);
        return {
            content: [{
                    type: "text",
                    text: `⚠️ Ferramenta '${name}' não encontrada. Um protótipo foi gerado para revisão em: ${prototypePath}. Valide o código para ativá-lo.`
                }],
            isError: true
        };
    }
    try {
        const result = await tool.handler(args);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
    catch (error) {
        return { content: [{ type: "text", text: `Erro na execução:` /*${error.message}`*/ }], isError: true };
    }
});
const transport = new stdio_js_1.StdioServerTransport();
server.connect(transport);
