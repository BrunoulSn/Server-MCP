import { z } from "zod";

const defaultPaths = [
    "/api", "/api/v1", "/api/v2", "/users", "/user", "/health", "/docs", "/swagger",
    "/login", "/auth", "/authenticate", "/products", "/product", "/orders", "/order",
    "/items", "/item", "/data", "/config", "/status", "/version", "/info", "/test"
];

export default {
    name: "discover_endpoints",
    description: "Tenta descobrir endpoints de uma API via wordlist de paths comuns. Faz requisições paralelas e retorna os que responderam com status diferente de 404.",
    inputSchema: z.object({
        baseUrl: z.string().url().describe("URL base da API"),
        method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).default("GET").describe("Método HTTP"),
        customPaths: z.array(z.string()).optional().describe("Paths customizados adicionais")
    }),
    handler: async ({ baseUrl, method, customPaths = [] }: { baseUrl: string, method: string, customPaths?: string[] }) => {
        try {
            const paths = [...defaultPaths, ...customPaths];
            const promises = paths.map(async (path) => {
                const url = `${baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl}${path}`;
                try {
                    const startTime = Date.now();
                    const response = await fetch(url, { method });
                    const latencyMs = Date.now() - startTime;
                    return response.status !== 404 ? { path, status: response.status, latencyMs } : null;
                } catch {
                    return null;
                }
            });

            const results = (await Promise.all(promises)).filter(r => r !== null);
            console.error(`[discover_endpoints] ${baseUrl} -> ${results.length}/${paths.length} endpoints encontrados`);
            
            return { found: results, total: paths.length, baseUrl };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            console.error(`[discover_endpoints] Erro: ${message}`);
            return { found: [], total: 0, baseUrl, error: message };
        }
    }
};