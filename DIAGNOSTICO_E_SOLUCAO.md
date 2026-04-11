# ANÁLISE e RESOLUÇÃO - MCP Server não reconhecido no Claude Desktop

## 📋 PROBLEMAS ENCONTRADOS E CORRIGIDOS

### 🔴 PROBLEMA 1: Conversão Incorreta de Zod Schema para JSON Schema
**Arquivo afetado**: `src/index.ts`  
**Linha**: 16-19

**Diagnóstico**:
```typescript
// ❌ ERRADO
const schema = tool.inputSchema instanceof z.ZodObject
  ? tool.inputSchema.shape      // ← Retorna validadores Zod, não JSON Schema!
  : {};
```

**Por que não funciona**:
- O MCP Proto especifica que `inputSchema` deve ser um JSON Schema válido
- `.shape` retorna um objeto com validadores Zod internos, não um JSON Schema
- O Claude desktop não consegue deserializar isso e reporta "tool não encontrada"

**Correção implementada**:
```typescript
// ✅ CORRETO
import { zodToJsonSchema } from "zod-to-json-schema";

const jsonSchema = zodToJsonSchema(tool.inputSchema);
server.tool(tool.name, tool.description, jsonSchema, handler);
```

---

### 🔴 PROBLEMA 2: Método de Registro de Tools Obsoleto
**Arquivo afetado**: `src/index.ts`  
**Linha**: 22

**Diagnóstico**:
```typescript
// ❌ ERRADO (SDK antiga)
server.registerTool(tool.name, { title, description, inputSchema }, handler);

// ✅ CORRETO (SDK atual)
server.tool(tool.name, description, jsonSchema, handler);
```

**Mudança na SDK**:
- A nova versão do `@modelcontextprotocol/sdk` mudou a API
- `registerTool()` foi substituído por `.tool()`
- A assinatura do método mudou

---

### ⚠️ PROBLEMA 3 (Potencial): Import Ausente
**O que faltava**:
```typescript
import { zodToJsonSchema } from "zod-to-json-schema";
```

**Solução**:
- A dependência já estava no `package.json`
- Import foi adicionado

---

## ✅ O QUE FOI CORRIGIDO

| Aspecto | Status |
|---------|--------|
| Conversão Zod → JSON Schema | ✅ Corrigido |
| Método de registro de tools | ✅ Corrigido |
| Import de zodToJsonSchema | ✅ Adicionado |
| TypeScript compilation | ✅ Sem erros |
| Todas as 12 ferramentas | ✅ Validadas |

---

## 🚀 PRÓXIMOS PASSOS

### 1. Compilar o projeto
```powershell
cd c:\MCP_Server-TCS\mcp-meta-server
npm run build
```

### 2. Configurar Claude Desktop
Localize: `%APPDATA%\Claude\claude_desktop_config.json`

Adicione (crie o arquivo se não existir):
```json
{
  "mcpServers": {
    "mcp-meta-server": {
      "command": "node",
      "args": ["C:\\MCP_Server-TCS\\mcp-meta-server\\dist\\index.js"]
    }
  }
}
```

**IMPORTANTE**: Use `\\` (barras invertidas duplicadas) nos caminhos Windows.

### 3. Reinicie Claude Desktop completamente
- Feche a aplicação completamente
- Espere 3 segundos
- Reabra a aplicação
- As ferramentas devem aparecer no início da conversa

### 4. Teste uma ferramenta
Se tudo funcionou, tente usar uma ferramenta simples no Claude:
```
Use a ferramenta "count_lines" para contar as linhas de um arquivo específico
```

---

## 🔍 TROUBLESHOOTING

Se ainda não funcionar:

### Verificar compilação
```powershell
npm run typecheck
npm run build
```

### Verificar estrutura do dist/
```powershell
Get-Item C:\MCP_Server-TCS\mcp-meta-server\dist\index.js
```

### Executar servidor localmente para debug
```powershell
npm run dev
```

Você deve ver:
```
[stderr] Starting MCP server...
[stderr] [Loader] 12 tools carregadas.
[stderr] [Server] 12 ferramentas registradas no McpServer.
[stderr] MCP server connected and running.
```

### Verificar logs do Claude
- Windows: `%APPDATA%\Claude\logs\`
- Procure por erros relacionados ao `mcp-meta-server`

---

## 📌 RESUMO TÉCNICO

**Raiz causa**: A transformação de `tool.inputSchema.shape` para JSON Schema não era feita corretamente. O MCP proto espera um JSON Schema válido que descreva os parâmetros de entrada da ferramenta, não validadores Zod.

**Analogia**: É como se você estivesse enviando o código-fonte de validação (Zod) em vez de um formulário HTML que o navegador consiga ler (JSON Schema).

**Garantias após correção**:
- ✅ Todas as 12 ferramentas devem estar visíveis no Claude Desktop
- ✅ Os esquemas de entrada serão corretamente validados
- ✅ As ferramentas podem ser chamadas com argumentos corretos

---

## 📚 FERRAMENTAS DISPONÍVEIS

Após a configuração, estas 12 ferramentas estarão disponíveis:

1. **analyze_dev_code** - Analisa código em busca de débitos técnicos
2. **compare_responses** - Compara respostas de endpoints
3. **count_lines** - Conta linhas de um arquivo
4. **discover_endpoints** - Descobre endpoints via wordlist
5. **file_exists** - Verifica se um arquivo existe
6. **file_size** - Obtém tamanho de arquivo
7. **format_json** - Formata JSON
8. **generate_openapi** - Gera spec OpenAPI
9. **infer_contract** - Infere contrato via GPT-4o
10. **list_files** - Lista arquivos de um diretório
11. **probe_endpoint** - Obtém info de um endpoint
12. **save_contract** - Salva contrato em disco

---

## 💡 DICA FINAL

Se tudo estiver funcionando no seu servidor local mas o Claude Desktop ainda não ver as ferramentas:

1. Verifique a indentação do `claude_desktop_config.json` (JSON é sensível a espaços)
2. Use o comando `jq .` para validar JSON no PowerShell:
   ```powershell
   Get-Content $env:APPDATA\Claude\claude_desktop_config.json | ConvertFrom-Json
   ```
3. Reinicie completamente o Claude (não apenas minimize)
