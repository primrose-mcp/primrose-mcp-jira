/**
 * Project Tools for Jira MCP Server
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { JiraClient } from '../client.js';
import { formatErrorResponse, formatResponse } from '../utils/formatters.js';

export function registerProjectTools(server: McpServer, client: JiraClient): void {
  // ===========================================================================
  // List Projects
  // ===========================================================================
  server.tool(
    'jira_list_projects',
    `List Jira projects.

Args:
  - startAt: Starting index (default: 0)
  - maxResults: Maximum results (default: 50)
  - searchQuery: Search query to filter projects
  - typeKey: Filter by project type (e.g., "software", "business")
  - orderBy: Order by field (e.g., "name", "-key" for descending)
  - format: Response format ('json' or 'markdown')

Returns:
  List of projects with key, name, type, and lead.`,
    {
      startAt: z.number().int().min(0).default(0),
      maxResults: z.number().int().min(1).max(100).default(50),
      searchQuery: z.string().optional().describe('Search query'),
      typeKey: z.string().optional().describe('Project type'),
      orderBy: z.string().optional().describe('Order by field'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ startAt, maxResults, searchQuery, typeKey, orderBy, format }) => {
      try {
        const result = await client.listProjects({
          startAt,
          maxResults,
          searchQuery,
          typeKey,
          orderBy,
        });
        return formatResponse(result, format, 'projects');
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Project
  // ===========================================================================
  server.tool(
    'jira_get_project',
    `Get details for a specific project.

Args:
  - projectIdOrKey: Project ID or key
  - expand: Comma-separated fields to expand (e.g., "lead,description")
  - format: Response format ('json' or 'markdown')

Returns:
  Project details including key, name, description, lead, etc.`,
    {
      projectIdOrKey: z.string().describe('Project ID or key'),
      expand: z.string().optional().describe('Fields to expand'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectIdOrKey, expand, format }) => {
      try {
        const project = await client.getProject(projectIdOrKey, {
          expand: expand?.split(',').map((e) => e.trim()),
        });
        return formatResponse(project, format, 'project');
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Create Project
  // ===========================================================================
  server.tool(
    'jira_create_project',
    `Create a new Jira project.

Args:
  - key: Project key (e.g., "PROJ")
  - name: Project name
  - projectTypeKey: Project type (e.g., "software", "business")
  - description: Project description (optional)
  - leadAccountId: Lead user account ID (optional)
  - assigneeType: Default assignee type ("PROJECT_LEAD" or "UNASSIGNED")

Returns:
  The created project.`,
    {
      key: z.string().describe('Project key'),
      name: z.string().describe('Project name'),
      projectTypeKey: z.string().describe('Project type'),
      description: z.string().optional().describe('Description'),
      leadAccountId: z.string().optional().describe('Lead account ID'),
      assigneeType: z.enum(['PROJECT_LEAD', 'UNASSIGNED']).optional(),
    },
    async ({ key, name, projectTypeKey, description, leadAccountId, assigneeType }) => {
      try {
        const project = await client.createProject({
          key,
          name,
          projectTypeKey,
          description,
          leadAccountId,
          assigneeType,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Project created', project }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Update Project
  // ===========================================================================
  server.tool(
    'jira_update_project',
    `Update an existing project.

Args:
  - projectIdOrKey: Project ID or key
  - key: New project key (optional)
  - name: New project name (optional)
  - description: New description (optional)
  - leadAccountId: New lead account ID (optional)
  - assigneeType: New default assignee type (optional)

Returns:
  The updated project.`,
    {
      projectIdOrKey: z.string().describe('Project ID or key'),
      key: z.string().optional().describe('New key'),
      name: z.string().optional().describe('New name'),
      description: z.string().optional().describe('New description'),
      leadAccountId: z.string().optional().describe('New lead'),
      assigneeType: z.enum(['PROJECT_LEAD', 'UNASSIGNED']).optional(),
    },
    async ({ projectIdOrKey, key, name, description, leadAccountId, assigneeType }) => {
      try {
        const project = await client.updateProject(projectIdOrKey, {
          key,
          name,
          description,
          leadAccountId,
          assigneeType,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Project updated', project }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Delete Project
  // ===========================================================================
  server.tool(
    'jira_delete_project',
    `Delete a project.

Args:
  - projectIdOrKey: Project ID or key

Returns:
  Confirmation of deletion.`,
    {
      projectIdOrKey: z.string().describe('Project ID or key'),
    },
    async ({ projectIdOrKey }) => {
      try {
        await client.deleteProject(projectIdOrKey);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Project deleted' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Project Components
  // ===========================================================================
  server.tool(
    'jira_get_project_components',
    `Get components for a project.

Args:
  - projectIdOrKey: Project ID or key

Returns:
  List of components with name, description, and lead.`,
    {
      projectIdOrKey: z.string().describe('Project ID or key'),
    },
    async ({ projectIdOrKey }) => {
      try {
        const components = await client.getProjectComponents(projectIdOrKey);
        return {
          content: [{ type: 'text', text: JSON.stringify(components, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Create Component
  // ===========================================================================
  server.tool(
    'jira_create_component',
    `Create a component in a project.

Args:
  - project: Project key
  - name: Component name
  - description: Component description (optional)
  - leadAccountId: Lead account ID (optional)

Returns:
  The created component.`,
    {
      project: z.string().describe('Project key'),
      name: z.string().describe('Component name'),
      description: z.string().optional().describe('Description'),
      leadAccountId: z.string().optional().describe('Lead account ID'),
    },
    async ({ project, name, description, leadAccountId }) => {
      try {
        const component = await client.createComponent({ project, name, description, leadAccountId });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Component created', component }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Delete Component
  // ===========================================================================
  server.tool(
    'jira_delete_component',
    `Delete a component.

Args:
  - componentId: Component ID

Returns:
  Confirmation of deletion.`,
    {
      componentId: z.string().describe('Component ID'),
    },
    async ({ componentId }) => {
      try {
        await client.deleteComponent(componentId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Component deleted' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Project Versions
  // ===========================================================================
  server.tool(
    'jira_get_project_versions',
    `Get versions (releases) for a project.

Args:
  - projectIdOrKey: Project ID or key
  - startAt: Starting index (default: 0)
  - maxResults: Maximum results (default: 50)
  - format: Response format ('json' or 'markdown')

Returns:
  List of versions with name, release date, and status.`,
    {
      projectIdOrKey: z.string().describe('Project ID or key'),
      startAt: z.number().int().min(0).default(0),
      maxResults: z.number().int().min(1).max(100).default(50),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectIdOrKey, startAt, maxResults, format }) => {
      try {
        const result = await client.getProjectVersions(projectIdOrKey, { startAt, maxResults });
        return formatResponse(result, format, 'versions');
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Create Version
  // ===========================================================================
  server.tool(
    'jira_create_version',
    `Create a version (release) in a project.

Args:
  - projectId: Project numeric ID
  - name: Version name
  - description: Version description (optional)
  - startDate: Start date (YYYY-MM-DD) (optional)
  - releaseDate: Release date (YYYY-MM-DD) (optional)
  - released: Whether already released (optional)
  - archived: Whether archived (optional)

Returns:
  The created version.`,
    {
      projectId: z.number().int().describe('Project ID'),
      name: z.string().describe('Version name'),
      description: z.string().optional().describe('Description'),
      startDate: z.string().optional().describe('Start date'),
      releaseDate: z.string().optional().describe('Release date'),
      released: z.boolean().optional().describe('Already released'),
      archived: z.boolean().optional().describe('Archived'),
    },
    async ({ projectId, name, description, startDate, releaseDate, released, archived }) => {
      try {
        const version = await client.createVersion({
          projectId,
          name,
          description,
          startDate,
          releaseDate,
          released,
          archived,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Version created', version }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Release Version
  // ===========================================================================
  server.tool(
    'jira_release_version',
    `Release a version (mark as released).

Args:
  - versionId: Version ID

Returns:
  Confirmation of release.`,
    {
      versionId: z.string().describe('Version ID'),
    },
    async ({ versionId }) => {
      try {
        await client.releaseVersion(versionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Version released' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Delete Version
  // ===========================================================================
  server.tool(
    'jira_delete_version',
    `Delete a version.

Args:
  - versionId: Version ID

Returns:
  Confirmation of deletion.`,
    {
      versionId: z.string().describe('Version ID'),
    },
    async ({ versionId }) => {
      try {
        await client.deleteVersion(versionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Version deleted' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // ===========================================================================
  // Get Project Roles
  // ===========================================================================
  server.tool(
    'jira_get_project_roles',
    `Get roles available in a project.

Args:
  - projectIdOrKey: Project ID or key

Returns:
  Map of role names to their URLs.`,
    {
      projectIdOrKey: z.string().describe('Project ID or key'),
    },
    async ({ projectIdOrKey }) => {
      try {
        const roles = await client.getProjectRoles(projectIdOrKey);
        return {
          content: [{ type: 'text', text: JSON.stringify(roles, null, 2) }],
        };
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );
}
