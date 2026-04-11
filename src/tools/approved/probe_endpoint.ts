import { z } from "zod";

export default {
    name: "probe_endpoint",
    description: "Faz uma requisição HTTP a um endpoint e captura status, headers, body e latência.",
    inputSchema: z.object({
        url: z.string().url().describe("URL completa do endpoint"),
        method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).default("GET").describe("Método HTTP"),
        headers: z.record(z.string()).optional().describe("Cabeçalhos HTTP opcionais"),
        body: z.string().optional().describe("Corpo da requisição opcional")
    }),
    handler: async ({ url, method, headers = {}, body }: { url: string, method: string, headers?: Record<string, string>, body?: string }) => {
        try {
            const startTime = Date.now();
            const response = await fetch(url, {
                method,
                headers,
                body
            });
            const latencyMs = Date.now() - startTime;
            const [responseBody, responseHeaders] = await Promise.all([
              response.text(),
              Promise.resolve(Object.fromEntries(response.headers.entries()))
            ]);

            console.error(`[probe_endpoint] ${method} ${url} -> ${response.status} (${latencyMs}ms)`);

            return { status: response.status, responseBody, responseHeaders, latencyMs };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            console.error(`[probe_endpoint] Erro ao acessar ${url}: ${message}`);
            return { status: 0, responseBody: "", responseHeaders: {}, latencyMs: 0, error: message };
        }
    }
};