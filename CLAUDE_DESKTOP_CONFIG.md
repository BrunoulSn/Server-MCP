# Configuração do MCP Server no Claude Desktop

## Resumo dos Problemas Corrigidos

### 1. ✅ Conversão de Schema Zod → JSON Schema
**Problema**: O código original estava usando `tool.inputSchema.shape` que retorna validadores Zod, não um JSON Schema válido.
```typescript
// ❌ INCORRETO
const schema = tool.inputSchema instanceof z.ZodObject
  ? tool.inputSchema.shape
  : {};
```

**Solução**: Usar `zodToJsonSchema()` para converter corretamente:
```typescript
// ✅ CORRETO
import { zodToJsonSchema } from "zod-to-json-schema";
const jsonSchema = zodToJsonSchema(tool.inputSchema);
```

### 2. ✅ Método de Registro de Ferramentas
**Problema**: O método `registerTool()` foi substituído por `tool()` na SDK atual.
```typescript
// ❌ INCORRETO
server.registerTool(tool.name, { title, description, inputSchema }, handler);

// ✅ CORRETO
server.tool(tool.name, description, jsonSchema, handler);
```

### 3. ✅ Estrutura de Resposta
As respostas agora estão no formato correto do MCP.

---

## Configuração no Claude Desktop

### Windows

1. **Construa o projeto**:
   ```powershell
   cd c:\MCP_Server-TCS\mcp-meta-server
   npm run build
   ```

2. **Localize o arquivo de configuração do Claude**:
   - Caminho: `%APPDATA%\Claude\claude_desktop_config.json`
   - Crie o arquivo se não existir

3. **Adicione a configuração do servidor MCP**:
   ```json
   {
     "mcpServers": {
       "mcp-meta-server": {
         "command": "node",
         "args": [
           "c:\\MCP_Server-TCS\\mcp-meta-server\\dist\\index.js"
         ]
       }
     }
   }
   ```

4. **Reinicie o Claude Desktop**
   - Feche completamente a aplicação
   - Reabra-a
   - A lista de ferramentas deve aparecer no início da conversa

### macOS

```json
{
  "mcpServers": {
    "mcp-meta-server": {
      "command": "node",
      "args": [
        "/path/to/mcp-meta-server/dist/index.js"
      ]
    }
  }
}
```

### Linux

```json
{
  "mcpServers": {
    "mcp-meta-server": {
      "command": "node",
      "args": [
        "/home/user/mcp-meta-server/dist/index.js"
      ]
    }
  }
}
```

---

## Testando o Servidor

### 1. Teste local com stdio:
```bash
npm run build
npm run start
```

Você deve ver:
```
[stderr] Starting MCP server...
[stderr] [Loader] 12 tools carregadas.
[stderr] [Server] 12 ferramentas registradas no McpServer.
[stderr] MCP server connected and running.
```

### 2. Verifique se as ferramentas estão sendo carregadas:

As ferramentas esperadas são:
- ✅ `analyze_dev_code` - Analisa código
- ✅ `compare_responses` - Compara respostas
- ✅ `count_lines` - Conta linhas
- ✅ `discover_endpoints` - Descobre endpoints
- ✅ `file_exists` - Verifica arquivo
- ✅ `file_size` - Tamanho de arquivo
- ✅ `format_json` - Formata JSON
- ✅ `generate_openapi` - Gera OpenAPI
- ✅ `infer_contract` - Infere contrato
- ✅ `list_files` - Lista arquivos
- ✅ `probe_endpoint` - Testa endpoint
- ✅ `save_contract` - Salva contrato

---

## Troubleshooting

### Claude Desktop não mostra as ferramentas

1. **Verificar o arquivo de configuração**:
   ```powershell
   Get-Content $env:APPDATA\Claude\claude_desktop_config.json | ConvertFrom-Json | ConvertTo-Json -Depth 10
   ```

2. **Verificar logs do Claude**:
   - Windows: `%APPDATA%\Claude\logs\`
   - macOS: `~/Library/Logs/Claude/`

3. **Testar compilação**:
   ```bash
   npm run typecheck
   npm run build
   ```

4. **Executar servidor em modo debug**:
   ```bash
   npm run dev
   ```

### Erro: "Tool não encontrada"

Isso significa que o servidor não está registrando as ferramentas corretamente. Verifique:
- Todas as ferramentas têm `default export`?
- O ToolLoader está carregando os arquivos `.ts` ou `.js`?
- As ferramentas têm `name`, `description`, `handler` e `inputSchema`?

---

## Estrutura Esperada de uma Ferramenta

```typescript
import { z } from "zod";

export default {
  name: "example_tool",
  description: "Descrição breve da ferramenta",
  inputSchema: z.object({
    param1: z.string().describe("Descrição do parâmetro"),
    param2: z.number().optional().describe("Parâmetro opcional")
  }),
  handler: async ({ param1, param2 }: { param1: string, param2?: number }) => {
    // Implementação da ferramenta
    return { result: "..." };
  }
};
```

---

## Próximos Passos

1. ✅ Corrigir `index.ts` (FEITO)
2. ✅ Compilar projeto (FEITO)
3. ⏳ Configurar `claude_desktop_config.json`
4. ⏳ Reiniciar Claude Desktop
5. ⏳ Testar as ferramentas
