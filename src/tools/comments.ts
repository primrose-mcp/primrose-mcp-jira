/**
 * Comment and Worklog Tools for Jira MCP Server
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { JiraClient } from '../client.js';
import { formatErrorResponse, formatResponse } from '../utils/formatters.js';

export function registerCommentTools(server: McpServer, client: JiraClient): void {
  // ===========================================================================
  // Get Comments
  // ===========================================================================
  server.tool(
    'jira_get_comments',
    `Get comments on an issue.

Args:
  - issueIdOrKey: Issue ID or key
  - startAt: Starting index (default: 0)
  - maxResults: Maximum results (default: 50)
  - format: Response format ('json' or 'markdown')

Returns:
  List of comments with author, body, and timestamps.`,
    {
      issueIdOrKey: z.string().describe('Issue ID or key'),
      startAt: z.number().int().min(0).default(0),
      maxResults: z.number().int().min(1).max(100).default(50),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ issueIdOrKey, startAt, maxResults, format }) => {
      try {
        const result = await client.getComments(issueIdOrKey, { startAt, maxResults });
        return formatResponse(result, format, 'comments');
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Add Comment
  // ===========================================================================
  server.tool(
    'jira_add_comment',
    `Add a comment to an issue.

Args:
  - issueIdOrKey: Issue ID or key
  - body: Comment body text

Returns:
  The created comment.`,
    {
      issueIdOrKey: z.string().describe('Issue ID or key'),
      body: z.string().describe('Comment body'),
    },
    async ({ issueIdOrKey, body }) => {
      try {
        const comment = await client.addComment(issueIdOrKey, body);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Comment added', comment }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Update Comment
  // ===========================================================================
  server.tool(
    'jira_update_comment',
    `Update an existing comment.

Args:
  - issueIdOrKey: Issue ID or key
  - commentId: Comment ID to update
  - body: New comment body

Returns:
  The updated comment.`,
    {
      issueIdOrKey: z.string().describe('Issue ID or key'),
      commentId: z.string().describe('Comment ID'),
      body: z.string().describe('New comment body'),
    },
    async ({ issueIdOrKey, commentId, body }) => {
      try {
        const comment = await client.updateComment(issueIdOrKey, commentId, body);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Comment updated', comment }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Delete Comment
  // ===========================================================================
  server.tool(
    'jira_delete_comment',
    `Delete a comment from an issue.

Args:
  - issueIdOrKey: Issue ID or key
  - commentId: Comment ID to delete

Returns:
  Confirmation of deletion.`,
    {
      issueIdOrKey: z.string().describe('Issue ID or key'),
      commentId: z.string().describe('Comment ID'),
    },
    async ({ issueIdOrKey, commentId }) => {
      try {
        await client.deleteComment(issueIdOrKey, commentId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Comment deleted' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Worklogs
  // ===========================================================================
  server.tool(
    'jira_get_worklogs',
    `Get work logs for an issue.

Args:
  - issueIdOrKey: Issue ID or key
  - startAt: Starting index (default: 0)
  - maxResults: Maximum results (default: 50)
  - format: Response format ('json' or 'markdown')

Returns:
  List of worklogs with author, time spent, and comments.`,
    {
      issueIdOrKey: z.string().describe('Issue ID or key'),
      startAt: z.number().int().min(0).default(0),
      maxResults: z.number().int().min(1).max(100).default(50),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ issueIdOrKey, startAt, maxResults, format }) => {
      try {
        const result = await client.getWorklogs(issueIdOrKey, { startAt, maxResults });
        return formatResponse(result, format, 'worklogs');
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Add Worklog
  // ===========================================================================
  server.tool(
    'jira_add_worklog',
    `Add a work log entry to an issue.

Args:
  - issueIdOrKey: Issue ID or key
  - timeSpent: Time spent (e.g., "2h 30m", "1d")
  - started: Start time in ISO format (optional, defaults to now)
  - comment: Work log comment (optional)

Returns:
  The created worklog.`,
    {
      issueIdOrKey: z.string().describe('Issue ID or key'),
      timeSpent: z.string().describe('Time spent (e.g., "2h 30m")'),
      started: z.string().optional().describe('Start time (ISO format)'),
      comment: z.string().optional().describe('Worklog comment'),
    },
    async ({ issueIdOrKey, timeSpent, started, comment }) => {
      try {
        const worklog = await client.addWorklog(issueIdOrKey, { timeSpent, started, comment });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Worklog added', worklog }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Update Worklog
  // ===========================================================================
  server.tool(
    'jira_update_worklog',
    `Update an existing work log entry.

Args:
  - issueIdOrKey: Issue ID or key
  - worklogId: Worklog ID to update
  - timeSpent: New time spent (optional)
  - started: New start time (optional)
  - comment: New comment (optional)

Returns:
  The updated worklog.`,
    {
      issueIdOrKey: z.string().describe('Issue ID or key'),
      worklogId: z.string().describe('Worklog ID'),
      timeSpent: z.string().optional().describe('New time spent'),
      started: z.string().optional().describe('New start time'),
      comment: z.string().optional().describe('New comment'),
    },
    async ({ issueIdOrKey, worklogId, timeSpent, started, comment }) => {
      try {
        const worklog = await client.updateWorklog(issueIdOrKey, worklogId, {
          timeSpent,
          started,
          comment,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Worklog updated', worklog }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Delete Worklog
  // ===========================================================================
  server.tool(
    'jira_delete_worklog',
    `Delete a work log entry.

Args:
  - issueIdOrKey: Issue ID or key
  - worklogId: Worklog ID to delete

Returns:
  Confirmation of deletion.`,
    {
      issueIdOrKey: z.string().describe('Issue ID or key'),
      worklogId: z.string().describe('Worklog ID'),
    },
    async ({ issueIdOrKey, worklogId }) => {
      try {
        await client.deleteWorklog(issueIdOrKey, worklogId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Worklog deleted' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );
}
