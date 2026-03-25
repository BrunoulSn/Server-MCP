import { z } from "zod";

export default {
  name: "infer_contract",
  description: "Recebe um JSON de resposta de um endpoint e usa a API da OpenAI (GPT-4o) para inferir o contrato TypeScript e o JSON Schema daquele endpoint.",
  inputSchema: z.object({
    responseBody: z.string().describe("Corpo da resposta em JSON"),
    endpointName: z.string().optional().describe("Nome do endpoint opcional"),
    method: z.string().optional().describe("Método HTTP opcional")
  }),
  handler: async ({ responseBody, endpointName = "unknown", method = "GET" }: { responseBody: string, endpointName?: string, method?: string }) => {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY não definida");
      }

      const prompt = `Analise este JSON de resposta de um endpoint API e gere:
1. Uma interface TypeScript representando o contrato de dados.
2. Um JSON Schema válido.
3. Uma descrição em português do que este endpoint retorna.

Endpoint: ${endpointName} (${method})
Resposta JSON: ${responseBody}

Responda apenas com um objeto JSON contendo as chaves: typescriptInterface (string), jsonSchema (objeto), description (string).`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      const result = JSON.parse(content);

      console.error(`[infer_contract] Contrato inferido para ${endpointName}`);

      return result;
    } catch (error) {
        let message: string;
        if (error instanceof Error)
            message = error.message;
        else
            message = "Unknown error";
      console.error(`[infer_contract] Erro: ${message}`);
      return {
        typescriptInterface: "",
        jsonSchema: {},
        description: "",
        error: message
      };
    }
  }
};