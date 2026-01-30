/**
 * Agile Tools for Jira MCP Server (Boards, Sprints, Epics)
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { JiraClient } from '../client.js';
import { formatErrorResponse, formatResponse } from '../utils/formatters.js';

export function registerAgileTools(server: McpServer, client: JiraClient): void {
  // ===========================================================================
  // List Boards
  // ===========================================================================
  server.tool(
    'jira_list_boards',
    `List Jira boards (Scrum, Kanban, Simple).

Args:
  - startAt: Starting index (default: 0)
  - maxResults: Maximum results (default: 50)
  - type: Board type filter ('scrum', 'kanban', 'simple')
  - name: Filter by board name (contains)
  - projectKeyOrId: Filter by project
  - format: Response format ('json' or 'markdown')

Returns:
  List of boards with ID, name, type, and project.`,
    {
      startAt: z.number().int().min(0).default(0),
      maxResults: z.number().int().min(1).max(100).default(50),
      type: z.enum(['scrum', 'kanban', 'simple']).optional().describe('Board type'),
      name: z.string().optional().describe('Filter by name'),
      projectKeyOrId: z.string().optional().describe('Filter by project'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ startAt, maxResults, type, name, projectKeyOrId, format }) => {
      try {
        const result = await client.getBoards({ startAt, maxResults, type, name, projectKeyOrId });
        return formatResponse(result, format, 'boards');
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Board
  // ===========================================================================
  server.tool(
    'jira_get_board',
    `Get details for a specific board.

Args:
  - boardId: Board ID

Returns:
  Board details including ID, name, type, and project.`,
    {
      boardId: z.number().int().describe('Board ID'),
    },
    async ({ boardId }) => {
      try {
        const board = await client.getBoard(boardId);
        return {
          content: [{ type: 'text', text: JSON.stringify(board, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Board Issues
  // ===========================================================================
  server.tool(
    'jira_get_board_issues',
    `Get all issues on a board.

Args:
  - boardId: Board ID
  - startAt: Starting index (default: 0)
  - maxResults: Maximum results (default: 50)
  - jql: Additional JQL filter (optional)
  - format: Response format ('json' or 'markdown')

Returns:
  List of issues on the board.`,
    {
      boardId: z.number().int().describe('Board ID'),
      startAt: z.number().int().min(0).default(0),
      maxResults: z.number().int().min(1).max(100).default(50),
      jql: z.string().optional().describe('Additional JQL filter'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ boardId, startAt, maxResults, jql, format }) => {
      try {
        const result = await client.getBoardIssues(boardId, { startAt, maxResults, jql });
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
  // Get Backlog Issues
  // ===========================================================================
  server.tool(
    'jira_get_backlog_issues',
    `Get issues in the backlog (not in any sprint).

Args:
  - boardId: Board ID
  - startAt: Starting index (default: 0)
  - maxResults: Maximum results (default: 50)
  - jql: Additional JQL filter (optional)
  - format: Response format ('json' or 'markdown')

Returns:
  List of backlog issues.`,
    {
      boardId: z.number().int().describe('Board ID'),
      startAt: z.number().int().min(0).default(0),
      maxResults: z.number().int().min(1).max(100).default(50),
      jql: z.string().optional().describe('Additional JQL filter'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ boardId, startAt, maxResults, jql, format }) => {
      try {
        const result = await client.getBacklogIssues(boardId, { startAt, maxResults, jql });
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
  // List Sprints
  // ===========================================================================
  server.tool(
    'jira_list_sprints',
    `List sprints for a board.

Args:
  - boardId: Board ID
  - startAt: Starting index (default: 0)
  - maxResults: Maximum results (default: 50)
  - state: Filter by state ('active', 'future', 'closed')
  - format: Response format ('json' or 'markdown')

Returns:
  List of sprints with ID, name, state, and dates.`,
    {
      boardId: z.number().int().describe('Board ID'),
      startAt: z.number().int().min(0).default(0),
      maxResults: z.number().int().min(1).max(100).default(50),
      state: z.enum(['active', 'future', 'closed']).optional().describe('Sprint state'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ boardId, startAt, maxResults, state, format }) => {
      try {
        const result = await client.getSprints(boardId, { startAt, maxResults, state });
        return formatResponse(result, format, 'sprints');
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Sprint
  // ===========================================================================
  server.tool(
    'jira_get_sprint',
    `Get details for a specific sprint.

Args:
  - sprintId: Sprint ID

Returns:
  Sprint details including ID, name, state, goal, and dates.`,
    {
      sprintId: z.number().int().describe('Sprint ID'),
    },
    async ({ sprintId }) => {
      try {
        const sprint = await client.getSprint(sprintId);
        return {
          content: [{ type: 'text', text: JSON.stringify(sprint, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Sprint Issues
  // ===========================================================================
  server.tool(
    'jira_get_sprint_issues',
    `Get issues in a sprint.

Args:
  - sprintId: Sprint ID
  - startAt: Starting index (default: 0)
  - maxResults: Maximum results (default: 50)
  - jql: Additional JQL filter (optional)
  - format: Response format ('json' or 'markdown')

Returns:
  List of issues in the sprint.`,
    {
      sprintId: z.number().int().describe('Sprint ID'),
      startAt: z.number().int().min(0).default(0),
      maxResults: z.number().int().min(1).max(100).default(50),
      jql: z.string().optional().describe('Additional JQL filter'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ sprintId, startAt, maxResults, jql, format }) => {
      try {
        const result = await client.getSprintIssues(sprintId, { startAt, maxResults, jql });
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
  // Create Sprint
  // ===========================================================================
  server.tool(
    'jira_create_sprint',
    `Create a new sprint.

Args:
  - name: Sprint name
  - originBoardId: Board ID for the sprint
  - startDate: Start date (ISO format, optional)
  - endDate: End date (ISO format, optional)
  - goal: Sprint goal (optional)

Returns:
  The created sprint.`,
    {
      name: z.string().describe('Sprint name'),
      originBoardId: z.number().int().describe('Board ID'),
      startDate: z.string().optional().describe('Start date'),
      endDate: z.string().optional().describe('End date'),
      goal: z.string().optional().describe('Sprint goal'),
    },
    async ({ name, originBoardId, startDate, endDate, goal }) => {
      try {
        const sprint = await client.createSprint({ name, originBoardId, startDate, endDate, goal });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Sprint created', sprint }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Update Sprint
  // ===========================================================================
  server.tool(
    'jira_update_sprint',
    `Update a sprint.

Args:
  - sprintId: Sprint ID
  - name: New name (optional)
  - state: New state ('future', 'active', 'closed') (optional)
  - startDate: New start date (optional)
  - endDate: New end date (optional)
  - goal: New goal (optional)

Returns:
  The updated sprint.`,
    {
      sprintId: z.number().int().describe('Sprint ID'),
      name: z.string().optional().describe('New name'),
      state: z.enum(['future', 'active', 'closed']).optional().describe('New state'),
      startDate: z.string().optional().describe('New start date'),
      endDate: z.string().optional().describe('New end date'),
      goal: z.string().optional().describe('New goal'),
    },
    async ({ sprintId, name, state, startDate, endDate, goal }) => {
      try {
        const sprint = await client.updateSprint(sprintId, { name, state, startDate, endDate, goal });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Sprint updated', sprint }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Delete Sprint
  // ===========================================================================
  server.tool(
    'jira_delete_sprint',
    `Delete a sprint.

Args:
  - sprintId: Sprint ID

Returns:
  Confirmation of deletion.`,
    {
      sprintId: z.number().int().describe('Sprint ID'),
    },
    async ({ sprintId }) => {
      try {
        await client.deleteSprint(sprintId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Sprint deleted' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Move Issues to Sprint
  // ===========================================================================
  server.tool(
    'jira_move_issues_to_sprint',
    `Move issues to a sprint.

Args:
  - sprintId: Target sprint ID
  - issueKeys: Comma-separated issue keys (e.g., "PROJ-1,PROJ-2")

Returns:
  Confirmation of move.`,
    {
      sprintId: z.number().int().describe('Sprint ID'),
      issueKeys: z.string().describe('Comma-separated issue keys'),
    },
    async ({ sprintId, issueKeys }) => {
      try {
        const keys = issueKeys.split(',').map((k) => k.trim());
        await client.moveIssuesToSprint(sprintId, keys);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Moved ${keys.length} issues to sprint` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Move Issues to Backlog
  // ===========================================================================
  server.tool(
    'jira_move_issues_to_backlog',
    `Move issues to the backlog (remove from sprint).

Args:
  - issueKeys: Comma-separated issue keys

Returns:
  Confirmation of move.`,
    {
      issueKeys: z.string().describe('Comma-separated issue keys'),
    },
    async ({ issueKeys }) => {
      try {
        const keys = issueKeys.split(',').map((k) => k.trim());
        await client.moveIssuesToBacklog(keys);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Moved ${keys.length} issues to backlog` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // List Epics
  // ===========================================================================
  server.tool(
    'jira_list_epics',
    `List epics for a board.

Args:
  - boardId: Board ID
  - startAt: Starting index (default: 0)
  - maxResults: Maximum results (default: 50)
  - format: Response format ('json' or 'markdown')

Returns:
  List of epics with ID, key, name, and status.`,
    {
      boardId: z.number().int().describe('Board ID'),
      startAt: z.number().int().min(0).default(0),
      maxResults: z.number().int().min(1).max(100).default(50),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ boardId, startAt, maxResults, format }) => {
      try {
        const result = await client.getEpics(boardId, { startAt, maxResults });
        return formatResponse(result, format, 'epics');
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Epic
  // ===========================================================================
  server.tool(
    'jira_get_epic',
    `Get details for a specific epic.

Args:
  - epicIdOrKey: Epic ID or key

Returns:
  Epic details including ID, key, name, summary, and status.`,
    {
      epicIdOrKey: z.string().describe('Epic ID or key'),
    },
    async ({ epicIdOrKey }) => {
      try {
        const epic = await client.getEpic(epicIdOrKey);
        return {
          content: [{ type: 'text', text: JSON.stringify(epic, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Epic Issues
  // ===========================================================================
  server.tool(
    'jira_get_epic_issues',
    `Get issues belonging to an epic.

Args:
  - epicIdOrKey: Epic ID or key
  - startAt: Starting index (default: 0)
  - maxResults: Maximum results (default: 50)
  - jql: Additional JQL filter (optional)
  - format: Response format ('json' or 'markdown')

Returns:
  List of issues in the epic.`,
    {
      epicIdOrKey: z.string().describe('Epic ID or key'),
      startAt: z.number().int().min(0).default(0),
      maxResults: z.number().int().min(1).max(100).default(50),
      jql: z.string().optional().describe('Additional JQL filter'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ epicIdOrKey, startAt, maxResults, jql, format }) => {
      try {
        const result = await client.getEpicIssues(epicIdOrKey, { startAt, maxResults, jql });
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
  // Move Issues to Epic
  // ===========================================================================
  server.tool(
    'jira_move_issues_to_epic',
    `Move issues to an epic.

Args:
  - epicIdOrKey: Target epic ID or key
  - issueKeys: Comma-separated issue keys

Returns:
  Confirmation of move.`,
    {
      epicIdOrKey: z.string().describe('Epic ID or key'),
      issueKeys: z.string().describe('Comma-separated issue keys'),
    },
    async ({ epicIdOrKey, issueKeys }) => {
      try {
        const keys = issueKeys.split(',').map((k) => k.trim());
        await client.moveIssuesToEpic(epicIdOrKey, keys);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Moved ${keys.length} issues to epic` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Remove Issues from Epic
  // ===========================================================================
  server.tool(
    'jira_remove_issues_from_epic',
    `Remove issues from their epic.

Args:
  - issueKeys: Comma-separated issue keys

Returns:
  Confirmation of removal.`,
    {
      issueKeys: z.string().describe('Comma-separated issue keys'),
    },
    async ({ issueKeys }) => {
      try {
        const keys = issueKeys.split(',').map((k) => k.trim());
        await client.removeIssuesFromEpic(keys);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Removed ${keys.length} issues from epic` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );
}
