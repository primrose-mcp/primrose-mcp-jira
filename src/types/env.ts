/**
 * Environment Bindings for Jira MCP Server
 *
 * MULTI-TENANT ARCHITECTURE:
 * This server supports multiple tenants. Tenant-specific credentials are passed
 * via request headers, NOT stored in wrangler secrets.
 *
 * Request Headers:
 * - X-Jira-Domain: Jira Cloud domain (e.g., "mycompany" for mycompany.atlassian.net)
 * - X-Jira-Email: User email for Basic Auth
 * - X-Jira-API-Token: API token for Basic Auth
 * - X-Jira-Access-Token: (Optional) OAuth 2.0 access token
 */

// =============================================================================
// Tenant Credentials (parsed from request headers)
// =============================================================================

export interface TenantCredentials {
  /** Jira Cloud domain (from X-Jira-Domain header) */
  domain: string;

  /** User email for Basic Auth (from X-Jira-Email header) */
  email?: string;

  /** API token for Basic Auth (from X-Jira-API-Token header) */
  apiToken?: string;

  /** OAuth 2.0 access token (from X-Jira-Access-Token header) */
  accessToken?: string;
}

/**
 * Parse tenant credentials from request headers
 */
export function parseTenantCredentials(request: Request): TenantCredentials {
  const headers = request.headers;

  return {
    domain: headers.get('X-Jira-Domain') || '',
    email: headers.get('X-Jira-Email') || undefined,
    apiToken: headers.get('X-Jira-API-Token') || undefined,
    accessToken: headers.get('X-Jira-Access-Token') || undefined,
  };
}

/**
 * Validate that required credentials are present
 */
export function validateCredentials(credentials: TenantCredentials): void {
  if (!credentials.domain) {
    throw new Error('Missing X-Jira-Domain header. Provide your Jira Cloud domain.');
  }

  // Either Basic Auth (email + API token) or OAuth access token is required
  const hasBasicAuth = credentials.email && credentials.apiToken;
  const hasOAuth = credentials.accessToken;

  if (!hasBasicAuth && !hasOAuth) {
    throw new Error(
      'Missing credentials. Provide either X-Jira-Email + X-Jira-API-Token headers, or X-Jira-Access-Token header.'
    );
  }
}

// =============================================================================
// Environment Configuration (from wrangler.jsonc vars and bindings)
// =============================================================================

export interface Env {
  /** Maximum character limit for responses */
  CHARACTER_LIMIT: string;

  /** Default page size for list operations */
  DEFAULT_PAGE_SIZE: string;

  /** Maximum page size allowed */
  MAX_PAGE_SIZE: string;

  /** KV namespace for OAuth token storage */
  OAUTH_KV?: KVNamespace;

  /** Durable Object namespace for MCP sessions */
  MCP_SESSIONS?: DurableObjectNamespace;

  /** Cloudflare AI binding (optional) */
  AI?: Ai;
}

// ===========================================================================
// Helper Functions
// ===========================================================================

export function getEnvNumber(env: Env, key: keyof Env, defaultValue: number): number {
  const value = env[key];
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

export function getCharacterLimit(env: Env): number {
  return getEnvNumber(env, 'CHARACTER_LIMIT', 50000);
}

export function getDefaultPageSize(env: Env): number {
  return getEnvNumber(env, 'DEFAULT_PAGE_SIZE', 20);
}

export function getMaxPageSize(env: Env): number {
  return getEnvNumber(env, 'MAX_PAGE_SIZE', 100);
}
