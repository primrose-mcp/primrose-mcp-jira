/**
 * Filter and Dashboard Tools for Jira MCP Server
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { JiraClient } from '../client.js';
import { formatErrorResponse, formatResponse } from '../utils/formatters.js';

export function registerFilterTools(server: McpServer, client: JiraClient): void {
  // ===========================================================================
  // Get My Filters
  // ===========================================================================
  server.tool(
    'jira_get_my_filters',
    `Get filters owned by the current user.

Args:
  - expand: Comma-separated fields to expand (e.g., "description,jql")

Returns:
  List of filters with ID, name, JQL, and owner.`,
    {
      expand: z.string().optional().describe('Fields to expand'),
    },
    async ({ expand }) => {
      try {
        const filters = await client.getMyFilters({
          expand: expand?.split(',').map((e) => e.trim()),
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(filters, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Favourite Filters
  // ===========================================================================
  server.tool(
    'jira_get_favourite_filters',
    `Get filters marked as favourite.

Returns:
  List of favourite filters.`,
    {},
    async () => {
      try {
        const filters = await client.getFavouriteFilters();
        return {
          content: [{ type: 'text', text: JSON.stringify(filters, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Filter
  // ===========================================================================
  server.tool(
    'jira_get_filter',
    `Get details for a specific filter.

Args:
  - filterId: Filter ID

Returns:
  Filter details including JQL, owner, and permissions.`,
    {
      filterId: z.string().describe('Filter ID'),
    },
    async ({ filterId }) => {
      try {
        const filter = await client.getFilter(filterId);
        return {
          content: [{ type: 'text', text: JSON.stringify(filter, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Create Filter
  // ===========================================================================
  server.tool(
    'jira_create_filter',
    `Create a new filter (saved search).

Args:
  - name: Filter name
  - jql: JQL query string
  - description: Filter description (optional)
  - favourite: Mark as favourite (optional)

Returns:
  The created filter.`,
    {
      name: z.string().describe('Filter name'),
      jql: z.string().describe('JQL query'),
      description: z.string().optional().describe('Description'),
      favourite: z.boolean().optional().describe('Mark as favourite'),
    },
    async ({ name, jql, description, favourite }) => {
      try {
        const filter = await client.createFilter({ name, jql, description, favourite });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Filter created', filter }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Update Filter
  // ===========================================================================
  server.tool(
    'jira_update_filter',
    `Update an existing filter.

Args:
  - filterId: Filter ID
  - name: New name (optional)
  - jql: New JQL query (optional)
  - description: New description (optional)
  - favourite: Mark as favourite (optional)

Returns:
  The updated filter.`,
    {
      filterId: z.string().describe('Filter ID'),
      name: z.string().optional().describe('New name'),
      jql: z.string().optional().describe('New JQL'),
      description: z.string().optional().describe('New description'),
      favourite: z.boolean().optional().describe('Mark as favourite'),
    },
    async ({ filterId, name, jql, description, favourite }) => {
      try {
        const filter = await client.updateFilter(filterId, { name, jql, description, favourite });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Filter updated', filter }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Delete Filter
  // ===========================================================================
  server.tool(
    'jira_delete_filter',
    `Delete a filter.

Args:
  - filterId: Filter ID

Returns:
  Confirmation of deletion.`,
    {
      filterId: z.string().describe('Filter ID'),
    },
    async ({ filterId }) => {
      try {
        await client.deleteFilter(filterId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Filter deleted' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // List Dashboards
  // ===========================================================================
  server.tool(
    'jira_list_dashboards',
    `List Jira dashboards.

Args:
  - startAt: Starting index (default: 0)
  - maxResults: Maximum results (default: 50)
  - filter: Filter type ('favourite', 'my')
  - format: Response format ('json' or 'markdown')

Returns:
  List of dashboards with ID, name, and owner.`,
    {
      startAt: z.number().int().min(0).default(0),
      maxResults: z.number().int().min(1).max(100).default(50),
      filter: z.enum(['favourite', 'my']).optional().describe('Filter type'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ startAt, maxResults, filter, format }) => {
      try {
        const result = await client.getDashboards({ startAt, maxResults, filter });
        return formatResponse(result, format, 'dashboards');
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Dashboard
  // ===========================================================================
  server.tool(
    'jira_get_dashboard',
    `Get details for a specific dashboard.

Args:
  - dashboardId: Dashboard ID

Returns:
  Dashboard details including name, owner, and permissions.`,
    {
      dashboardId: z.string().describe('Dashboard ID'),
    },
    async ({ dashboardId }) => {
      try {
        const dashboard = await client.getDashboard(dashboardId);
        return {
          content: [{ type: 'text', text: JSON.stringify(dashboard, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );
}
