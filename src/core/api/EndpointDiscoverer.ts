import { DiscoveredEndpoint, EndpointDiscoveryResult, EndpointDiscovererOptions } from './types.js';

const DEFAULT_PATHS = [
  '/api', '/api/v1', '/api/v2', '/health', '/status', '/ping',
  '/users', '/posts', '/comments', '/products', '/orders',
  '/auth', '/login', '/logout', '/register', '/me', '/profile',
  '/items', '/categories', '/tags', '/search', '/upload',
  '/docs', '/swagger', '/openapi', '/graphql',
];

export class EndpointDiscoverer {
  async discover(
    baseUrl: string,
    options: EndpointDiscovererOptions = {}
  ): Promise<EndpointDiscoveryResult> {
    const { customPaths = [], method = 'GET' } = options;
    const allPaths = [...new Set([...DEFAULT_PATHS, ...customPaths])];

    try {
      const results = await Promise.allSettled(
        allPaths.map(async (path): Promise<DiscoveredEndpoint | null> => {
          const start = Date.now();
          try {
            const res = await fetch(`${baseUrl}${path}`, { method });
            const latencyMs = Date.now() - start;
            return res.status !== 404 ? { path, status: res.status, latencyMs } : null;
          } catch {
            return null;
          }
        })
      );

      const found: DiscoveredEndpoint[] = results
        .filter((r): r is PromiseFulfilledResult<DiscoveredEndpoint> =>
          r.status === 'fulfilled' && r.value !== null
        )
        .map((r) => r.value);

      return { baseUrl, found, total: allPaths.length };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { baseUrl, found: [], total: 0, error: message };
    }
  }
}