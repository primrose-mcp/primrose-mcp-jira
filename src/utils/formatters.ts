/**
 * Response Formatting Utilities for Jira MCP Server
 */

import type {
  JiraBoard,
  JiraComment,
  JiraDashboard,
  JiraFilter,
  JiraIssue,
  JiraProject,
  JiraSprint,
  JiraUser,
  JiraWorklog,
  PaginatedResponse,
  ResponseFormat,
} from '../types/entities.js';
import { JiraApiError, formatErrorForLogging } from './errors.js';

/**
 * MCP tool response type
 */
export interface ToolResponse {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

/**
 * Format a successful response
 */
export function formatResponse(
  data: unknown,
  format: ResponseFormat,
  entityType: string
): ToolResponse {
  if (format === 'markdown') {
    return {
      content: [{ type: 'text', text: formatAsMarkdown(data, entityType) }],
    };
  }
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Format an error response
 */
export function formatErrorResponse(error: unknown): ToolResponse {
  const errorInfo = formatErrorForLogging(error);

  let message: string;
  if (error instanceof JiraApiError) {
    message = `Error: ${error.message}`;
    if (error.retryable) {
      message += ' (retryable)';
    }
  } else if (error instanceof Error) {
    message = `Error: ${error.message}`;
  } else {
    message = `Error: ${String(error)}`;
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ error: message, details: errorInfo }, null, 2),
      },
    ],
    isError: true,
  };
}

/**
 * Format data as Markdown
 */
function formatAsMarkdown(data: unknown, entityType: string): string {
  if (isPaginatedResponse(data)) {
    return formatPaginatedAsMarkdown(data, entityType);
  }

  if (Array.isArray(data)) {
    return formatArrayAsMarkdown(data, entityType);
  }

  if (typeof data === 'object' && data !== null) {
    return formatObjectAsMarkdown(data as Record<string, unknown>, entityType);
  }

  return String(data);
}

/**
 * Type guard for paginated response
 */
function isPaginatedResponse(data: unknown): data is PaginatedResponse<unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'items' in data &&
    Array.isArray((data as PaginatedResponse<unknown>).items)
  );
}

/**
 * Format paginated response as Markdown
 */
function formatPaginatedAsMarkdown(data: PaginatedResponse<unknown>, entityType: string): string {
  const lines: string[] = [];

  lines.push(`## ${capitalize(entityType)}`);
  lines.push('');

  if (data.total !== undefined) {
    lines.push(`**Total:** ${data.total} | **Showing:** ${data.count}`);
  } else {
    lines.push(`**Showing:** ${data.count}`);
  }

  if (data.hasMore) {
    lines.push(`**More available:** Yes (startAt: ${data.startAt + data.maxResults})`);
  }
  lines.push('');

  if (data.items.length === 0) {
    lines.push('_No items found._');
    return lines.join('\n');
  }

  switch (entityType) {
    case 'issues':
      lines.push(formatIssuesTable(data.items as JiraIssue[]));
      break;
    case 'projects':
      lines.push(formatProjectsTable(data.items as JiraProject[]));
      break;
    case 'users':
      lines.push(formatUsersTable(data.items as JiraUser[]));
      break;
    case 'boards':
      lines.push(formatBoardsTable(data.items as JiraBoard[]));
      break;
    case 'sprints':
      lines.push(formatSprintsTable(data.items as JiraSprint[]));
      break;
    case 'comments':
      lines.push(formatCommentsTable(data.items as JiraComment[]));
      break;
    case 'worklogs':
      lines.push(formatWorklogsTable(data.items as JiraWorklog[]));
      break;
    case 'filters':
      lines.push(formatFiltersTable(data.items as JiraFilter[]));
      break;
    case 'dashboards':
      lines.push(formatDashboardsTable(data.items as JiraDashboard[]));
      break;
    default:
      lines.push(formatGenericTable(data.items));
  }

  return lines.join('\n');
}

/**
 * Format issues as Markdown table
 */
function formatIssuesTable(issues: JiraIssue[]): string {
  const lines: string[] = [];
  lines.push('| Key | Summary | Status | Priority | Assignee | Type |');
  lines.push('|---|---|---|---|---|---|');

  for (const issue of issues) {
    const assignee = issue.fields.assignee?.displayName || 'Unassigned';
    const priority = issue.fields.priority?.name || '-';
    lines.push(
      `| ${issue.key} | ${truncate(issue.fields.summary, 50)} | ${issue.fields.status.name} | ${priority} | ${assignee} | ${issue.fields.issuetype.name} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format projects as Markdown table
 */
function formatProjectsTable(projects: JiraProject[]): string {
  const lines: string[] = [];
  lines.push('| Key | Name | Type | Lead |');
  lines.push('|---|---|---|---|');

  for (const project of projects) {
    const lead = project.lead?.displayName || '-';
    lines.push(`| ${project.key} | ${project.name} | ${project.projectTypeKey} | ${lead} |`);
  }

  return lines.join('\n');
}

/**
 * Format users as Markdown table
 */
function formatUsersTable(users: JiraUser[]): string {
  const lines: string[] = [];
  lines.push('| Account ID | Display Name | Email | Active |');
  lines.push('|---|---|---|---|');

  for (const user of users) {
    lines.push(
      `| ${user.accountId} | ${user.displayName} | ${user.emailAddress || '-'} | ${user.active ? 'Yes' : 'No'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format boards as Markdown table
 */
function formatBoardsTable(boards: JiraBoard[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Type | Project |');
  lines.push('|---|---|---|---|');

  for (const board of boards) {
    const project = board.location?.projectKey || '-';
    lines.push(`| ${board.id} | ${board.name} | ${board.type} | ${project} |`);
  }

  return lines.join('\n');
}

/**
 * Format sprints as Markdown table
 */
function formatSprintsTable(sprints: JiraSprint[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | State | Start | End |');
  lines.push('|---|---|---|---|---|');

  for (const sprint of sprints) {
    const start = sprint.startDate ? sprint.startDate.split('T')[0] : '-';
    const end = sprint.endDate ? sprint.endDate.split('T')[0] : '-';
    lines.push(`| ${sprint.id} | ${sprint.name} | ${sprint.state} | ${start} | ${end} |`);
  }

  return lines.join('\n');
}

/**
 * Format comments as Markdown table
 */
function formatCommentsTable(comments: JiraComment[]): string {
  const lines: string[] = [];
  lines.push('| ID | Author | Created | Updated |');
  lines.push('|---|---|---|---|');

  for (const comment of comments) {
    const author = comment.author?.displayName || 'Unknown';
    const created = comment.created.split('T')[0];
    const updated = comment.updated.split('T')[0];
    lines.push(`| ${comment.id} | ${author} | ${created} | ${updated} |`);
  }

  return lines.join('\n');
}

/**
 * Format worklogs as Markdown table
 */
function formatWorklogsTable(worklogs: JiraWorklog[]): string {
  const lines: string[] = [];
  lines.push('| ID | Author | Time Spent | Started | Created |');
  lines.push('|---|---|---|---|---|');

  for (const worklog of worklogs) {
    const author = worklog.author?.displayName || 'Unknown';
    const started = worklog.started.split('T')[0];
    const created = worklog.created.split('T')[0];
    lines.push(`| ${worklog.id} | ${author} | ${worklog.timeSpent} | ${started} | ${created} |`);
  }

  return lines.join('\n');
}

/**
 * Format filters as Markdown table
 */
function formatFiltersTable(filters: JiraFilter[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Owner | Favourite |');
  lines.push('|---|---|---|---|');

  for (const filter of filters) {
    const owner = filter.owner?.displayName || '-';
    lines.push(`| ${filter.id} | ${filter.name} | ${owner} | ${filter.favourite ? 'Yes' : 'No'} |`);
  }

  return lines.join('\n');
}

/**
 * Format dashboards as Markdown table
 */
function formatDashboardsTable(dashboards: JiraDashboard[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Owner | Favourite |');
  lines.push('|---|---|---|---|');

  for (const dashboard of dashboards) {
    const owner = dashboard.owner?.displayName || '-';
    lines.push(
      `| ${dashboard.id} | ${dashboard.name} | ${owner} | ${dashboard.isFavourite ? 'Yes' : 'No'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format a generic array as Markdown table
 */
function formatGenericTable(items: unknown[]): string {
  if (items.length === 0) return '_No items_';

  const first = items[0] as Record<string, unknown>;
  const keys = Object.keys(first).slice(0, 5);

  const lines: string[] = [];
  lines.push(`| ${keys.join(' | ')} |`);
  lines.push(`|${keys.map(() => '---').join('|')}|`);

  for (const item of items) {
    const record = item as Record<string, unknown>;
    const values = keys.map((k) => String(record[k] ?? '-'));
    lines.push(`| ${values.join(' | ')} |`);
  }

  return lines.join('\n');
}

/**
 * Format an array as Markdown
 */
function formatArrayAsMarkdown(data: unknown[], entityType: string): string {
  return formatGenericTable(data);
}

/**
 * Format a single object as Markdown
 */
function formatObjectAsMarkdown(data: Record<string, unknown>, entityType: string): string {
  const lines: string[] = [];
  lines.push(`## ${capitalize(entityType.replace(/s$/, ''))}`);
  lines.push('');

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'object') {
      lines.push(`**${formatKey(key)}:**`);
      lines.push('```json');
      lines.push(JSON.stringify(value, null, 2));
      lines.push('```');
    } else {
      lines.push(`**${formatKey(key)}:** ${value}`);
    }
  }

  return lines.join('\n');
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a key for display (camelCase to Title Case)
 */
function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Truncate string with ellipsis
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}
