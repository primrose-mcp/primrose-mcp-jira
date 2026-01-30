/**
 * Jira MCP Server - Main Entry Point
 *
 * This file sets up the MCP server using Cloudflare's Agents SDK.
 * It provides comprehensive access to Jira Cloud REST API v3 and Agile API.
 *
 * MULTI-TENANT ARCHITECTURE:
 * Tenant credentials are parsed from request headers, allowing a single
 * server deployment to serve multiple customers.
 *
 * Required Headers:
 * - X-Jira-Domain: Your Jira Cloud domain (e.g., "mycompany" for mycompany.atlassian.net)
 * - X-Jira-Email: User email for Basic Auth
 * - X-Jira-API-Token: API token for Basic Auth
 *
 * Alternative:
 * - X-Jira-Access-Token: OAuth 2.0 access token
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpAgent } from 'agents/mcp';
import { createJiraClient } from './client.js';
import {
  registerAgileTools,
  registerCommentTools,
  registerFilterTools,
  registerIssueTools,
  registerMetadataTools,
  registerProjectTools,
  registerUserTools,
} from './tools/index.js';
import {
  type Env,
  type TenantCredentials,
  parseTenantCredentials,
  validateCredentials,
} from './types/env.js';

// =============================================================================
// MCP Server Configuration
// =============================================================================

const SERVER_NAME = 'primrose-mcp-jira';
const SERVER_VERSION = '1.0.0';

// =============================================================================
// MCP Agent (Stateful - uses Durable Objects)
// =============================================================================

export class JiraMcpAgent extends McpAgent<Env> {
  server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  async init() {
    throw new Error(
      'Stateful mode (McpAgent) is not supported for multi-tenant deployments. ' +
        'Use the stateless /mcp endpoint with X-Jira-* headers instead.'
    );
  }
}

// =============================================================================
// Stateless MCP Server (Recommended - no Durable Objects needed)
// =============================================================================

function createStatelessServer(credentials: TenantCredentials): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Create client with tenant-specific credentials
  const client = createJiraClient(credentials);

  // Register all tool groups
  registerIssueTools(server, client);
  registerCommentTools(server, client);
  registerProjectTools(server, client);
  registerAgileTools(server, client);
  registerUserTools(server, client);
  registerMetadataTools(server, client);
  registerFilterTools(server, client);

  // Test connection tool
  server.tool(
    'jira_test_connection',
    `Test the connection to the Jira API.

Returns:
  Connection status and current user info.`,
    {},
    async () => {
      try {
        const result = await client.testConnection();
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Get current user tool
  server.tool(
    'jira_get_myself',
    `Get the current authenticated user's details.

Returns:
  Current user info including display name, email, and account ID.`,
    {},
    async () => {
      try {
        const myself = await client.getMyself();
        return {
          content: [{ type: 'text', text: JSON.stringify(myself, null, 2) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  return server;
}

// =============================================================================
// Worker Export
// =============================================================================

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', server: SERVER_NAME }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stateless MCP endpoint
    if (url.pathname === '/mcp' && request.method === 'POST') {
      // Parse tenant credentials from request headers
      const credentials = parseTenantCredentials(request);

      // Validate credentials are present
      try {
        validateCredentials(credentials);
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: error instanceof Error ? error.message : 'Invalid credentials',
            required_headers: [
              'X-Jira-Domain',
              'X-Jira-Email + X-Jira-API-Token (or X-Jira-Access-Token)',
            ],
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Create server with tenant-specific credentials
      const server = createStatelessServer(credentials);

      // Use createMcpHandler for streamable HTTP
      const { createMcpHandler } = await import('agents/mcp');
      const handler = createMcpHandler(server);
      return handler(request, env, ctx);
    }

    // SSE endpoint (not supported in stateless mode)
    if (url.pathname === '/sse') {
      return new Response('SSE endpoint requires Durable Objects. Enable in wrangler.jsonc.', {
        status: 501,
      });
    }

    // Default response
    return new Response(
      JSON.stringify({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        description: 'Multi-tenant Jira MCP Server',
        endpoints: {
          mcp: '/mcp (POST) - Streamable HTTP MCP endpoint',
          health: '/health - Health check',
        },
        authentication: {
          description: 'Pass tenant credentials via request headers',
          required_headers: {
            'X-Jira-Domain': 'Jira Cloud domain (e.g., "mycompany" for mycompany.atlassian.net)',
            'X-Jira-Email': 'User email for Basic Auth',
            'X-Jira-API-Token': 'API token for Basic Auth',
          },
          alternative: {
            'X-Jira-Access-Token': 'OAuth 2.0 access token (instead of email + API token)',
          },
        },
        tools: {
          issues: [
            'jira_search_issues',
            'jira_get_issue',
            'jira_create_issue',
            'jira_update_issue',
            'jira_delete_issue',
            'jira_assign_issue',
            'jira_get_transitions',
            'jira_transition_issue',
            'jira_get_changelog',
          ],
          comments: [
            'jira_get_comments',
            'jira_add_comment',
            'jira_update_comment',
            'jira_delete_comment',
            'jira_get_worklogs',
            'jira_add_worklog',
            'jira_update_worklog',
            'jira_delete_worklog',
          ],
          projects: [
            'jira_list_projects',
            'jira_get_project',
            'jira_create_project',
            'jira_update_project',
            'jira_delete_project',
            'jira_get_project_components',
            'jira_create_component',
            'jira_delete_component',
            'jira_get_project_versions',
            'jira_create_version',
            'jira_release_version',
            'jira_delete_version',
            'jira_get_project_roles',
          ],
          agile: [
            'jira_list_boards',
            'jira_get_board',
            'jira_get_board_issues',
            'jira_get_backlog_issues',
            'jira_list_sprints',
            'jira_get_sprint',
            'jira_get_sprint_issues',
            'jira_create_sprint',
            'jira_update_sprint',
            'jira_delete_sprint',
            'jira_move_issues_to_sprint',
            'jira_move_issues_to_backlog',
            'jira_list_epics',
            'jira_get_epic',
            'jira_get_epic_issues',
            'jira_move_issues_to_epic',
            'jira_remove_issues_from_epic',
          ],
          users: [
            'jira_get_user',
            'jira_search_users',
            'jira_find_assignable_users',
            'jira_list_groups',
            'jira_get_group_members',
            'jira_get_watchers',
            'jira_add_watcher',
            'jira_remove_watcher',
            'jira_get_votes',
            'jira_add_vote',
            'jira_remove_vote',
          ],
          metadata: [
            'jira_get_issue_types',
            'jira_get_project_issue_types',
            'jira_get_priorities',
            'jira_get_statuses',
            'jira_get_project_statuses',
            'jira_get_resolutions',
            'jira_get_fields',
            'jira_get_issue_link_types',
            'jira_create_issue_link',
            'jira_delete_issue_link',
            'jira_get_labels',
            'jira_get_server_info',
            'jira_delete_attachment',
          ],
          filters: [
            'jira_get_my_filters',
            'jira_get_favourite_filters',
            'jira_get_filter',
            'jira_create_filter',
            'jira_update_filter',
            'jira_delete_filter',
            'jira_list_dashboards',
            'jira_get_dashboard',
          ],
          connection: ['jira_test_connection', 'jira_get_myself'],
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
