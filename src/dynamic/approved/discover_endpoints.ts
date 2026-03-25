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
                const url = baseUrl.endsWith("/") ? baseUrl + path.slice(1) : baseUrl + path;
                try {
                    const startTime = Date.now();
                    const response = await fetch(url, { method });
                    const latencyMs = Date.now() - startTime;
                    if (response.status !== 404) {
                        return { path, status: response.status, latencyMs };
                    }
                } catch (error) {
                    // Ignorar erros de rede
                }
                return null;
            });

            const results = await Promise.all(promises);
            const found = results.filter(r => r !== null);

            console.error(`[discover_endpoints] ${baseUrl} -> ${found.length}/${paths.length} endpoints encontrados`);

            return {
                found,
                total: paths.length,
                baseUrl
            };
        } catch (error) {
            let message: String;
            if (error instanceof Error)
                message = error.message;
            else
                message = "Unknown error";
            console.error(`[discover_endpoints] Erro: ${message}`);
            return {
                found: [],
                total: 0,
                baseUrl,
                error: message
            };
        }
    }
};