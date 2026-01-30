/**
 * User and Group Tools for Jira MCP Server
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { JiraClient } from '../client.js';
import { formatErrorResponse, formatResponse } from '../utils/formatters.js';

export function registerUserTools(server: McpServer, client: JiraClient): void {
  // ===========================================================================
  // Get User
  // ===========================================================================
  server.tool(
    'jira_get_user',
    `Get details for a specific user.

Args:
  - accountId: User account ID

Returns:
  User details including display name, email, and status.`,
    {
      accountId: z.string().describe('User account ID'),
    },
    async ({ accountId }) => {
      try {
        const user = await client.getUser(accountId);
        return {
          content: [{ type: 'text', text: JSON.stringify(user, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Search Users
  // ===========================================================================
  server.tool(
    'jira_search_users',
    `Search for users.

Args:
  - query: Search query (name or email)
  - startAt: Starting index (default: 0)
  - maxResults: Maximum results (default: 50)
  - format: Response format ('json' or 'markdown')

Returns:
  List of matching users.`,
    {
      query: z.string().describe('Search query'),
      startAt: z.number().int().min(0).default(0),
      maxResults: z.number().int().min(1).max(100).default(50),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ query, startAt, maxResults, format }) => {
      try {
        const users = await client.findUsers({ query, startAt, maxResults });
        const response = {
          items: users,
          count: users.length,
          startAt,
          maxResults,
          hasMore: users.length === maxResults,
        };
        return formatResponse(response, format, 'users');
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Find Assignable Users
  // ===========================================================================
  server.tool(
    'jira_find_assignable_users',
    `Find users who can be assigned to issues.

Args:
  - projectKey: Project key (optional, provide this or issueKey)
  - issueKey: Issue key (optional, provide this or projectKey)
  - query: Search query to filter users (optional)
  - startAt: Starting index (default: 0)
  - maxResults: Maximum results (default: 50)
  - format: Response format ('json' or 'markdown')

Returns:
  List of assignable users.`,
    {
      projectKey: z.string().optional().describe('Project key'),
      issueKey: z.string().optional().describe('Issue key'),
      query: z.string().optional().describe('Search query'),
      startAt: z.number().int().min(0).default(0),
      maxResults: z.number().int().min(1).max(100).default(50),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectKey, issueKey, query, startAt, maxResults, format }) => {
      try {
        const users = await client.findAssignableUsers({
          projectKey,
          issueKey,
          query,
          startAt,
          maxResults,
        });
        const response = {
          items: users,
          count: users.length,
          startAt,
          maxResults,
          hasMore: users.length === maxResults,
        };
        return formatResponse(response, format, 'users');
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // List Groups
  // ===========================================================================
  server.tool(
    'jira_list_groups',
    `List Jira groups.

Args:
  - query: Filter by group name (optional)
  - startAt: Starting index (default: 0)
  - maxResults: Maximum results (default: 50)
  - format: Response format ('json' or 'markdown')

Returns:
  List of groups.`,
    {
      query: z.string().optional().describe('Filter by name'),
      startAt: z.number().int().min(0).default(0),
      maxResults: z.number().int().min(1).max(100).default(50),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ query, startAt, maxResults, format }) => {
      try {
        const result = await client.getGroups({ query, startAt, maxResults });
        return formatResponse(result, format, 'groups');
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Group Members
  // ===========================================================================
  server.tool(
    'jira_get_group_members',
    `Get members of a group.

Args:
  - groupName: Group name
  - startAt: Starting index (default: 0)
  - maxResults: Maximum results (default: 50)
  - format: Response format ('json' or 'markdown')

Returns:
  List of users in the group.`,
    {
      groupName: z.string().describe('Group name'),
      startAt: z.number().int().min(0).default(0),
      maxResults: z.number().int().min(1).max(100).default(50),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ groupName, startAt, maxResults, format }) => {
      try {
        const result = await client.getGroupMembers(groupName, { startAt, maxResults });
        return formatResponse(result, format, 'users');
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Watchers
  // ===========================================================================
  server.tool(
    'jira_get_watchers',
    `Get watchers of an issue.

Args:
  - issueIdOrKey: Issue ID or key

Returns:
  Watch count and list of watchers.`,
    {
      issueIdOrKey: z.string().describe('Issue ID or key'),
    },
    async ({ issueIdOrKey }) => {
      try {
        const result = await client.getWatchers(issueIdOrKey);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Add Watcher
  // ===========================================================================
  server.tool(
    'jira_add_watcher',
    `Add a watcher to an issue.

Args:
  - issueIdOrKey: Issue ID or key
  - accountId: User account ID to add as watcher

Returns:
  Confirmation of addition.`,
    {
      issueIdOrKey: z.string().describe('Issue ID or key'),
      accountId: z.string().describe('User account ID'),
    },
    async ({ issueIdOrKey, accountId }) => {
      try {
        await client.addWatcher(issueIdOrKey, accountId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Watcher added' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Remove Watcher
  // ===========================================================================
  server.tool(
    'jira_remove_watcher',
    `Remove a watcher from an issue.

Args:
  - issueIdOrKey: Issue ID or key
  - accountId: User account ID to remove

Returns:
  Confirmation of removal.`,
    {
      issueIdOrKey: z.string().describe('Issue ID or key'),
      accountId: z.string().describe('User account ID'),
    },
    async ({ issueIdOrKey, accountId }) => {
      try {
        await client.removeWatcher(issueIdOrKey, accountId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Watcher removed' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Votes
  // ===========================================================================
  server.tool(
    'jira_get_votes',
    `Get votes on an issue.

Args:
  - issueIdOrKey: Issue ID or key

Returns:
  Vote count and list of voters.`,
    {
      issueIdOrKey: z.string().describe('Issue ID or key'),
    },
    async ({ issueIdOrKey }) => {
      try {
        const result = await client.getVotes(issueIdOrKey);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Add Vote
  // ===========================================================================
  server.tool(
    'jira_add_vote',
    `Vote for an issue.

Args:
  - issueIdOrKey: Issue ID or key

Returns:
  Confirmation of vote.`,
    {
      issueIdOrKey: z.string().describe('Issue ID or key'),
    },
    async ({ issueIdOrKey }) => {
      try {
        await client.addVote(issueIdOrKey);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Vote added' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Remove Vote
  // ===========================================================================
  server.tool(
    'jira_remove_vote',
    `Remove vote from an issue.

Args:
  - issueIdOrKey: Issue ID or key

Returns:
  Confirmation of vote removal.`,
    {
      issueIdOrKey: z.string().describe('Issue ID or key'),
    },
    async ({ issueIdOrKey }) => {
      try {
        await client.removeVote(issueIdOrKey);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Vote removed' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );
}
