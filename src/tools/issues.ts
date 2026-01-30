/**
 * Issue Tools for Jira MCP Server
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { JiraClient } from '../client.js';
import { formatErrorResponse, formatResponse } from '../utils/formatters.js';

export function registerIssueTools(server: McpServer, client: JiraClient): void {
  // ===========================================================================
  // Search Issues
  // ===========================================================================
  server.tool(
    'jira_search_issues',
    `Search for Jira issues using JQL (Jira Query Language).

Args:
  - jql: JQL query string (e.g., "project = PROJ AND status = Open")
  - startAt: Starting index for pagination (default: 0)
  - maxResults: Maximum results to return (default: 50, max: 100)
  - fields: Comma-separated list of fields to return
  - format: Response format ('json' or 'markdown')

Returns:
  List of matching issues with their details.`,
    {
      jql: z.string().describe('JQL query string'),
      startAt: z.number().int().min(0).default(0).describe('Starting index'),
      maxResults: z.number().int().min(1).max(100).default(50).describe('Max results'),
      fields: z.string().optional().describe('Comma-separated fields to return'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ jql, startAt, maxResults, fields, format }) => {
      try {
        const result = await client.searchIssues({
          jql,
          startAt,
          maxResults,
          fields: fields?.split(',').map((f) => f.trim()),
        });
        const response = {
          items: result.issues,
          count: result.issues.length,
          total: result.total,
          startAt: result.startAt,
          maxResults: result.maxResults,
          hasMore: result.startAt + result.issues.length < result.total,
        };
        return formatResponse(response, format, 'issues');
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Issue
  // ===========================================================================
  server.tool(
    'jira_get_issue',
    `Get detailed information about a specific Jira issue.

Args:
  - issueIdOrKey: Issue ID or key (e.g., "PROJ-123")
  - fields: Comma-separated list of fields to return
  - expand: Comma-separated list of fields to expand (e.g., "changelog,comments")
  - format: Response format ('json' or 'markdown')

Returns:
  Complete issue details including summary, description, status, assignee, etc.`,
    {
      issueIdOrKey: z.string().describe('Issue ID or key'),
      fields: z.string().optional().describe('Comma-separated fields'),
      expand: z.string().optional().describe('Fields to expand'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ issueIdOrKey, fields, expand, format }) => {
      try {
        const issue = await client.getIssue(issueIdOrKey, {
          fields: fields?.split(',').map((f) => f.trim()),
          expand: expand?.split(',').map((f) => f.trim()),
        });
        return formatResponse(issue, format, 'issue');
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Create Issue
  // ===========================================================================
  server.tool(
    'jira_create_issue',
    `Create a new Jira issue.

Args:
  - projectKey: Project key (e.g., "PROJ")
  - issueType: Issue type name (e.g., "Bug", "Story", "Task")
  - summary: Issue summary/title
  - description: Issue description (optional)
  - priority: Priority name (e.g., "High", "Medium", "Low") (optional)
  - assigneeId: Account ID of assignee (optional)
  - labels: Comma-separated labels (optional)
  - components: Comma-separated component names (optional)
  - fixVersions: Comma-separated version names (optional)
  - dueDate: Due date in YYYY-MM-DD format (optional)
  - parentKey: Parent issue key for subtasks (optional)

Returns:
  Created issue with ID, key, and self URL.`,
    {
      projectKey: z.string().describe('Project key'),
      issueType: z.string().describe('Issue type name'),
      summary: z.string().describe('Issue summary'),
      description: z.string().optional().describe('Issue description'),
      priority: z.string().optional().describe('Priority name'),
      assigneeId: z.string().optional().describe('Assignee account ID'),
      labels: z.string().optional().describe('Comma-separated labels'),
      components: z.string().optional().describe('Comma-separated components'),
      fixVersions: z.string().optional().describe('Comma-separated versions'),
      dueDate: z.string().optional().describe('Due date (YYYY-MM-DD)'),
      parentKey: z.string().optional().describe('Parent issue key'),
    },
    async ({
      projectKey,
      issueType,
      summary,
      description,
      priority,
      assigneeId,
      labels,
      components,
      fixVersions,
      dueDate,
      parentKey,
    }) => {
      try {
        const result = await client.createIssue({
          projectKey,
          issueType,
          summary,
          description,
          priority,
          assigneeId,
          labels: labels?.split(',').map((l) => l.trim()),
          components: components?.split(',').map((c) => c.trim()),
          fixVersions: fixVersions?.split(',').map((v) => v.trim()),
          dueDate,
          parentKey,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Issue ${result.key} created`, issue: result },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Update Issue
  // ===========================================================================
  server.tool(
    'jira_update_issue',
    `Update an existing Jira issue.

Args:
  - issueIdOrKey: Issue ID or key to update
  - summary: New summary (optional)
  - description: New description (optional)
  - priority: New priority name (optional)
  - assigneeId: New assignee account ID (optional, use empty string to unassign)
  - labels: New labels (comma-separated, replaces existing) (optional)
  - components: New components (comma-separated, replaces existing) (optional)
  - fixVersions: New fix versions (comma-separated, replaces existing) (optional)
  - dueDate: New due date (YYYY-MM-DD) (optional)

Returns:
  Confirmation of update.`,
    {
      issueIdOrKey: z.string().describe('Issue ID or key'),
      summary: z.string().optional().describe('New summary'),
      description: z.string().optional().describe('New description'),
      priority: z.string().optional().describe('New priority'),
      assigneeId: z.string().optional().describe('New assignee ID'),
      labels: z.string().optional().describe('New labels (comma-separated)'),
      components: z.string().optional().describe('New components'),
      fixVersions: z.string().optional().describe('New fix versions'),
      dueDate: z.string().optional().describe('New due date'),
    },
    async ({
      issueIdOrKey,
      summary,
      description,
      priority,
      assigneeId,
      labels,
      components,
      fixVersions,
      dueDate,
    }) => {
      try {
        await client.updateIssue(issueIdOrKey, {
          summary,
          description,
          priority,
          assigneeId,
          labels: labels?.split(',').map((l) => l.trim()),
          components: components?.split(',').map((c) => c.trim()),
          fixVersions: fixVersions?.split(',').map((v) => v.trim()),
          dueDate,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Issue ${issueIdOrKey} updated` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Delete Issue
  // ===========================================================================
  server.tool(
    'jira_delete_issue',
    `Delete a Jira issue.

Args:
  - issueIdOrKey: Issue ID or key to delete
  - deleteSubtasks: Whether to delete subtasks (default: false)

Returns:
  Confirmation of deletion.`,
    {
      issueIdOrKey: z.string().describe('Issue ID or key'),
      deleteSubtasks: z.boolean().default(false).describe('Delete subtasks'),
    },
    async ({ issueIdOrKey, deleteSubtasks }) => {
      try {
        await client.deleteIssue(issueIdOrKey, deleteSubtasks);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Issue ${issueIdOrKey} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Assign Issue
  // ===========================================================================
  server.tool(
    'jira_assign_issue',
    `Assign or unassign a Jira issue.

Args:
  - issueIdOrKey: Issue ID or key
  - accountId: Account ID of assignee (use empty string to unassign)

Returns:
  Confirmation of assignment.`,
    {
      issueIdOrKey: z.string().describe('Issue ID or key'),
      accountId: z.string().describe('Assignee account ID (empty to unassign)'),
    },
    async ({ issueIdOrKey, accountId }) => {
      try {
        await client.assignIssue(issueIdOrKey, accountId || null);
        const message = accountId
          ? `Issue ${issueIdOrKey} assigned to ${accountId}`
          : `Issue ${issueIdOrKey} unassigned`;
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, message }, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Transitions
  // ===========================================================================
  server.tool(
    'jira_get_transitions',
    `Get available transitions for an issue.

Args:
  - issueIdOrKey: Issue ID or key

Returns:
  List of available transitions with IDs and target statuses.`,
    {
      issueIdOrKey: z.string().describe('Issue ID or key'),
    },
    async ({ issueIdOrKey }) => {
      try {
        const transitions = await client.getTransitions(issueIdOrKey);
        return {
          content: [{ type: 'text', text: JSON.stringify(transitions, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Transition Issue
  // ===========================================================================
  server.tool(
    'jira_transition_issue',
    `Transition an issue to a new status.

Args:
  - issueIdOrKey: Issue ID or key
  - transitionId: Transition ID (get from jira_get_transitions)
  - comment: Optional comment to add with transition
  - resolution: Optional resolution name (e.g., "Done", "Fixed")

Returns:
  Confirmation of transition.`,
    {
      issueIdOrKey: z.string().describe('Issue ID or key'),
      transitionId: z.string().describe('Transition ID'),
      comment: z.string().optional().describe('Comment to add'),
      resolution: z.string().optional().describe('Resolution name'),
    },
    async ({ issueIdOrKey, transitionId, comment, resolution }) => {
      try {
        await client.transitionIssue(issueIdOrKey, { transitionId, comment, resolution });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Issue ${issueIdOrKey} transitioned` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Changelog
  // ===========================================================================
  server.tool(
    'jira_get_changelog',
    `Get the changelog (history) for an issue.

Args:
  - issueIdOrKey: Issue ID or key
  - startAt: Starting index (default: 0)
  - maxResults: Maximum results (default: 50)
  - format: Response format ('json' or 'markdown')

Returns:
  List of changes with author, date, and field changes.`,
    {
      issueIdOrKey: z.string().describe('Issue ID or key'),
      startAt: z.number().int().min(0).default(0),
      maxResults: z.number().int().min(1).max(100).default(50),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ issueIdOrKey, startAt, maxResults, format }) => {
      try {
        const result = await client.getChangelog(issueIdOrKey, { startAt, maxResults });
        return formatResponse(result, format, 'changelog');
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );
}
