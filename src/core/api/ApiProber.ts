import { HttpMethod, ProbeResult, ApiProberOptions } from './types.js';

/**
 * Wrapper sobre a ferramenta MCP probe_endpoint.
 * Responsável por fazer requisições HTTP reais e retornar
 * resultados tipados com tratamento de erro centralizado.
 */
export class ApiProber {
  private defaultHeaders: Record<string, string>;

  constructor(defaultHeaders: Record<string, string> = {}) {
    this.defaultHeaders = defaultHeaders;
  }

  async probe(
    url: string,
    method: HttpMethod = 'GET',
    options: ApiProberOptions = {}
  ): Promise<ProbeResult> {
    const { headers = {}, body } = options;

    try {
      const startTime = Date.now();
      const response = await fetch(url, {
        method,
        headers: { ...this.defaultHeaders, ...headers },
        body,
      });
      const latencyMs = Date.now() - startTime;

      const rawBody = await response.text();

      let parsedBody: unknown;
      try {
        parsedBody = JSON.parse(rawBody);
      } catch {
        parsedBody = rawBody;
      }

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        url,
        method,
        status: response.status,
        ok: response.ok,
        latencyMs,
        body: parsedBody,
        headers: responseHeaders,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        url,
        method,
        status: 0,
        ok: false,
        latencyMs: 0,
        body: null,
        headers: {},
        error: message,
      };
    }
  }

  async probeMany(
    urls: string[],
    method: HttpMethod = 'GET',
    options: ApiProberOptions = {}
  ): Promise<ProbeResult[]> {
    return Promise.all(urls.map((url) => this.probe(url, method, options)));
  }
}