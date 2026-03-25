import { z } from "zod";
import yaml from "js-yaml";

type Endpoint = {
  path: string;
  method: string;
  responseBody: string;
  description?: string;
};

function inferSchema(value: any): any {
  if (Array.isArray(value)) {
    return {
      type: "array",
      items: value.length ? inferSchema(value[0]) : { type: "object" }
    };
  }

  if (value === null) return { type: "null" };

  switch (typeof value) {
    case "string":
      return { type: "string" };
    case "number":
      return { type: "number" };
    case "boolean":
      return { type: "boolean" };
    case "object":
      return {
        type: "object",
        properties: Object.fromEntries(
          Object.entries(value).map(([k, v]) => [k, inferSchema(v)])
        )
      };
    default:
      return { type: "string" };
  }
}

function safeJsonParse(input: string) {
  try {
    return JSON.parse(input);
  } catch {
    throw new Error("Invalid JSON in responseBody");
  }
}

export default {
  name: "generate_openapi",
  description:
    "Gera um documento OpenAPI 3.0 completo e profissional baseado em endpoints.",
  inputSchema: z.object({
    apiName: z.string(),
    baseUrl: z.string().url(),
    endpoints: z.array(
      z.object({
        path: z.string(),
        method: z.string(),
        responseBody: z.string(),
        description: z.string().optional()
      })
    )
  }),

  handler: async ({
    apiName,
    baseUrl,
    endpoints
  }: {
    apiName: string;
    baseUrl: string;
    endpoints: Endpoint[];
  }) => {
    try {
      const paths: Record<string, any> = {};

      endpoints.forEach(({ path, method, responseBody, description }) => {
        const parsed = safeJsonParse(responseBody);
        const schema = inferSchema(parsed);

        const normalizedMethod = method.toLowerCase();

        paths[path] ??= {};
        paths[path][normalizedMethod] = {
          summary: description || `${method.toUpperCase()} ${path}`,
          tags: [path.split("/")[1] || "default"],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema,
                  example: parsed
                }
              }
            },
            "400": {
              description: "Bad Request"
            },
            "500": {
              description: "Internal Server Error"
            }
          }
        };
      });

      const doc = {
        openapi: "3.0.0",
        info: {
          title: apiName,
          version: "1.0.0"
        },
        servers: [{ url: baseUrl }],
        paths
      };

      const yamlStr = yaml.dump(doc, {
        noRefs: true,
        lineWidth: 120
      });

      console.error(
        `[generate_openapi] Generated ${endpoints.length} endpoints successfully`
      );

      return {
        yaml: yamlStr,
        endpointCount: endpoints.length
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";

      console.error(`[generate_openapi] Error: ${message}`);

      return {
        yaml: "",
        endpointCount: 0,
        error: message
      };
    }
  }
};