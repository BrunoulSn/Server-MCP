# 🚀 GUIA RÁPIDO - Resolver MCP Server não funciona no Claude Desktop

## ⚡ RESUMO DOS PROBLEMAS CORRIGIDOS

| Problema | Status | Arquivo |
|----------|--------|---------|
| ❌ `inputSchema.shape` retornava Zod, não JSON Schema | ✅ CORRIGIDO | `src/index.ts` |
| ❌ Faltava importar `zodToJsonSchema` | ✅ CORRIGIDO | `src/index.ts` |
| ❌ Método `registerTool()` obsoleto | ✅ CORRIGIDO | `src/index.ts` |

---

## 🔧 O QUE MUDAR

### Antes ❌
```typescript
// src/index.ts - LINHA 17-19 (ERRADO)
const schema = tool.inputSchema instanceof z.ZodObject
  ? tool.inputSchema.shape       // ← NÃO É JSON Schema!
  : {};

server.registerTool(tool.name, { title, description, inputSchema: schema }, handler);
```

### Depois ✅
```typescript
// src/index.ts - AGORA CORRETO
import { zodToJsonSchema } from "zod-to-json-schema";  // ← ADICIONADO

const jsonSchema = zodToJsonSchema(tool.inputSchema);  // ← CORRETO

server.tool(tool.name, tool.description, jsonSchema, handler);  // ← API correta
```

---

## 📋 CHECKLIST DE ATIVAÇÃO

- [ ] **1. Compilar**
  ```powershell
  cd C:\MCP_Server-TCS\mcp-meta-server
  npm run build
  ```

- [ ] **2. Criar/Atualizar config do Claude**
  
  Arquivo: `C:\Users\[SEU_USUARIO]\AppData\Roaming\Claude\claude_desktop_config.json`
  
  Conteúdo:
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

- [ ] **3. Fechar Claude Desktop completamente**

- [ ] **4. Reabrir Claude Desktop**

- [ ] **5. Testar uma ferramenta**
  ```
  Claude: "Use a ferramenta count_lines para contar linhas do arquivo C:\seu_arquivo.txt"
  ```

---

## ⚙️ EXECUÇÃO AUTOMÁTICA (Recomendado)

Se preferir automação, execute o script PowerShell que foi criado:

```powershell
# Abra PowerShell como administrador E execute:
powershell -ExecutionPolicy Bypass -File "C:\MCP_Server-TCS\mcp-meta-server\setup-mcp.ps1"
```

Este script:
- ✅ Compila o projeto
- ✅ Valida a compilação
- ✅ Cria o arquivo de config
- ✅ Valida o JSON
- ✅ Mostra instruções finais

---

## 🎯 RESULTADO ESPERADO

Ao abrir Claude Desktop, você deve ver algo assim no início:

```
Você tem 12 ferramentas MCP disponíveis:
1. analyze_dev_code
2. compare_responses
3. count_lines
4. discover_endpoints
5. file_exists
6. file_size
7. format_json
8. generate_openapi
9. infer_contract
10. list_files
11. probe_endpoint
12. save_contract
```

---

## 🐛 Se Ainda Não Funcionar

### Verificação Passo a Passo

1. **O arquivo `dist/index.js` existe?**
   ```powershell
   Test-Path "C:\MCP_Server-TCS\mcp-meta-server\dist\index.js"
   ```

2. **Config JSON é válida?**
   ```powershell
   Get-Content "$env:APPDATA\Claude\claude_desktop_config.json" | ConvertFrom-Json
   ```

3. **Servidor funciona localmente?**
   ```powershell
   cd "C:\MCP_Server-TCS\mcp-meta-server"
   npm run dev
   ```
   
   Você deve ver:
   ```
   [stderr] Starting MCP server...
   [stderr] [Loader] 12 tools carregadas.
   [stderr] [Server] 12 ferramentas registradas no McpServer.
   [stderr] MCP server connected and running.
   ```

4. **Logs do Claude dizem o quê?**
   ```powershell
   Get-Content "$env:APPDATA\Claude\logs\*" -Tail 50
   ```

---

## 📚 DOCUMENTAÇÃO COMPLETA

- [DIAGNOSTICO_E_SOLUCAO.md](./DIAGNOSTICO_E_SOLUCAO.md) - Análise técnica profunda
- [CLAUDE_DESKTOP_CONFIG.md](./CLAUDE_DESKTOP_CONFIG.md) - Guia de configuração
- [setup-mcp.ps1](./setup-mcp.ps1) - Script de automação

---

## 🎓 PARA APRENDER

**Por que `inputSchema.shape` não funciona?**

```javascript
// Zod Schema
const schema = z.object({ name: z.string() });

// ❌ ERRADO: shape retorna isso (não é JSON Schema válido)
schema.shape
// { name: ZodString { ... } }

// ✅ CORRETO: zodToJsonSchema retorna isso (JSON Schema válido)
zodToJsonSchema(schema)
// { type: "object", properties: { name: { type: "string" } } }
```

O MCP proto espera um [JSON Schema](http://json-schema.org/) válido que o cliente possa deserializar. Zod é uma biblioteca de **validação**, não de **esquema**.

---

## ✅ Arquivo index.ts - Versão Corrigida

Veja [src/index.ts](./src/index.ts) para a versão completa corrigida.

**Principais mudanças:**
- ✅ Import de `zodToJsonSchema` adicionado
- ✅ Conversão correta para JSON Schema na linha 22-28
- ✅ Método `server.tool()` correto na linha 30
- ✅ Tratamento de erro melhorado para conversão de schema

---

## 💡 ÚLTIMA DICA

Se o Claude Desktop continuar sem reconhecer as ferramentas após tudo isso:

1. Feche Claude Designer completamente (não apenas minimize)
2. Aguarde 5 segundos
3. Abra novamente
4. Iniciará um novo processo que lerá o config.json

Às vezes o cache da aplicação precisa ser limpo.

---

**Versão**: 1.0 - Corrigido em 03/04/2026  
**Especialista**: Sistema MCP Server  
**Status**: ✅ Pronto para uso
