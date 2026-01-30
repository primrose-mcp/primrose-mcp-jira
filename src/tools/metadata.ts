/**
 * Metadata Tools for Jira MCP Server (Issue Types, Priorities, Statuses, etc.)
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { JiraClient } from '../client.js';
import { formatErrorResponse } from '../utils/formatters.js';

export function registerMetadataTools(server: McpServer, client: JiraClient): void {
  // ===========================================================================
  // Get Issue Types
  // ===========================================================================
  server.tool(
    'jira_get_issue_types',
    `Get all issue types available in the Jira instance.

Returns:
  List of issue types with ID, name, description, and subtask flag.`,
    {},
    async () => {
      try {
        const types = await client.getIssueTypes();
        return {
          content: [{ type: 'text', text: JSON.stringify(types, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Issue Types for Project
  // ===========================================================================
  server.tool(
    'jira_get_project_issue_types',
    `Get issue types available for a specific project.

Args:
  - projectIdOrKey: Project ID or key

Returns:
  List of issue types available in the project.`,
    {
      projectIdOrKey: z.string().describe('Project ID or key'),
    },
    async ({ projectIdOrKey }) => {
      try {
        const types = await client.getIssueTypesForProject(projectIdOrKey);
        return {
          content: [{ type: 'text', text: JSON.stringify(types, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Priorities
  // ===========================================================================
  server.tool(
    'jira_get_priorities',
    `Get all issue priorities.

Returns:
  List of priorities with ID, name, and description.`,
    {},
    async () => {
      try {
        const priorities = await client.getPriorities();
        return {
          content: [{ type: 'text', text: JSON.stringify(priorities, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Statuses
  // ===========================================================================
  server.tool(
    'jira_get_statuses',
    `Get all issue statuses.

Returns:
  List of statuses with ID, name, and category.`,
    {},
    async () => {
      try {
        const statuses = await client.getStatuses();
        return {
          content: [{ type: 'text', text: JSON.stringify(statuses, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Statuses for Project
  // ===========================================================================
  server.tool(
    'jira_get_project_statuses',
    `Get statuses available for a specific project.

Args:
  - projectIdOrKey: Project ID or key

Returns:
  List of statuses available in the project.`,
    {
      projectIdOrKey: z.string().describe('Project ID or key'),
    },
    async ({ projectIdOrKey }) => {
      try {
        const statuses = await client.getStatusesForProject(projectIdOrKey);
        return {
          content: [{ type: 'text', text: JSON.stringify(statuses, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Resolutions
  // ===========================================================================
  server.tool(
    'jira_get_resolutions',
    `Get all issue resolutions.

Returns:
  List of resolutions with ID, name, and description.`,
    {},
    async () => {
      try {
        const resolutions = await client.getResolutions();
        return {
          content: [{ type: 'text', text: JSON.stringify(resolutions, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Fields
  // ===========================================================================
  server.tool(
    'jira_get_fields',
    `Get all fields (system and custom) available in Jira.

Returns:
  List of fields with ID, name, type, and whether custom.`,
    {},
    async () => {
      try {
        const fields = await client.getFields();
        return {
          content: [{ type: 'text', text: JSON.stringify(fields, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Issue Link Types
  // ===========================================================================
  server.tool(
    'jira_get_issue_link_types',
    `Get all issue link types.

Returns:
  List of link types with ID, name, and inward/outward descriptions.`,
    {},
    async () => {
      try {
        const linkTypes = await client.getIssueLinkTypes();
        return {
          content: [{ type: 'text', text: JSON.stringify(linkTypes, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Create Issue Link
  // ===========================================================================
  server.tool(
    'jira_create_issue_link',
    `Create a link between two issues.

Args:
  - type: Link type name (e.g., "Blocks", "Relates to")
  - inwardIssueKey: Inward issue key
  - outwardIssueKey: Outward issue key
  - comment: Comment to add with the link (optional)

Returns:
  Confirmation of link creation.`,
    {
      type: z.string().describe('Link type name'),
      inwardIssueKey: z.string().describe('Inward issue key'),
      outwardIssueKey: z.string().describe('Outward issue key'),
      comment: z.string().optional().describe('Comment'),
    },
    async ({ type, inwardIssueKey, outwardIssueKey, comment }) => {
      try {
        await client.createIssueLink({ type, inwardIssueKey, outwardIssueKey, comment });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Issue link created' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Delete Issue Link
  // ===========================================================================
  server.tool(
    'jira_delete_issue_link',
    `Delete an issue link.

Args:
  - linkId: Link ID

Returns:
  Confirmation of deletion.`,
    {
      linkId: z.string().describe('Link ID'),
    },
    async ({ linkId }) => {
      try {
        await client.deleteIssueLink(linkId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Issue link deleted' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Labels
  // ===========================================================================
  server.tool(
    'jira_get_labels',
    `Get all labels used in Jira.

Args:
  - startAt: Starting index (default: 0)
  - maxResults: Maximum results (default: 100)

Returns:
  List of label strings.`,
    {
      startAt: z.number().int().min(0).default(0),
      maxResults: z.number().int().min(1).max(1000).default(100),
    },
    async ({ startAt, maxResults }) => {
      try {
        const result = await client.getLabels({ startAt, maxResults });
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Server Info
  // ===========================================================================
  server.tool(
    'jira_get_server_info',
    `Get Jira server information.

Returns:
  Server info including base URL, version, and title.`,
    {},
    async () => {
      try {
        const info = await client.getServerInfo();
        return {
          content: [{ type: 'text', text: JSON.stringify(info, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Delete Attachment
  // ===========================================================================
  server.tool(
    'jira_delete_attachment',
    `Delete an attachment.

Args:
  - attachmentId: Attachment ID

Returns:
  Confirmation of deletion.`,
    {
      attachmentId: z.string().describe('Attachment ID'),
    },
    async ({ attachmentId }) => {
      try {
        await client.deleteAttachment(attachmentId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Attachment deleted' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );
}
