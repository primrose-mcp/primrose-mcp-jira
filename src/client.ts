/**
 * Jira Cloud API Client
 *
 * Comprehensive client for Jira Cloud REST API v3 and Agile API.
 * Supports multi-tenant architecture with per-request credentials.
 *
 * API Reference:
 * - REST API v3: https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/
 * - Agile API: https://developer.atlassian.com/cloud/jira/software/rest/
 */

import type {
  ADFDocument,
  JiraAttachment,
  JiraBoard,
  JiraChangelogEntry,
  JiraComment,
  JiraComponent,
  JiraDashboard,
  JiraEpic,
  JiraField,
  JiraFilter,
  JiraGroup,
  JiraIssue,
  JiraIssueLinkType,
  JiraIssueType,
  JiraMyself,
  JiraPriority,
  JiraProject,
  JiraProjectRole,
  JiraResolution,
  JiraSearchResult,
  JiraSprint,
  JiraStatus,
  JiraTransition,
  JiraUser,
  JiraVersion,
  JiraWorklog,
  PaginatedResponse,
} from './types/entities.js';
import type { TenantCredentials } from './types/env.js';
import { AuthenticationError, JiraApiError, RateLimitError } from './utils/errors.js';

// =============================================================================
// Jira Client Interface
// =============================================================================

export interface JiraClient {
  // Connection
  testConnection(): Promise<{ connected: boolean; message: string }>;
  getMyself(): Promise<JiraMyself>;

  // Issues
  searchIssues(params: SearchIssuesParams): Promise<JiraSearchResult>;
  getIssue(
    issueIdOrKey: string,
    params?: GetIssueParams
  ): Promise<JiraIssue>;
  createIssue(params: CreateIssueParams): Promise<{ id: string; key: string; self: string }>;
  updateIssue(issueIdOrKey: string, params: UpdateIssueParams): Promise<void>;
  deleteIssue(issueIdOrKey: string, deleteSubtasks?: boolean): Promise<void>;
  assignIssue(issueIdOrKey: string, accountId: string | null): Promise<void>;
  getTransitions(issueIdOrKey: string): Promise<JiraTransition[]>;
  transitionIssue(issueIdOrKey: string, params: TransitionIssueParams): Promise<void>;
  getChangelog(
    issueIdOrKey: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<JiraChangelogEntry>>;

  // Issue Links
  createIssueLink(params: CreateIssueLinkParams): Promise<void>;
  deleteIssueLink(linkId: string): Promise<void>;
  getIssueLinkTypes(): Promise<JiraIssueLinkType[]>;

  // Comments
  getComments(
    issueIdOrKey: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<JiraComment>>;
  getComment(issueIdOrKey: string, commentId: string): Promise<JiraComment>;
  addComment(issueIdOrKey: string, body: string | ADFDocument): Promise<JiraComment>;
  updateComment(
    issueIdOrKey: string,
    commentId: string,
    body: string | ADFDocument
  ): Promise<JiraComment>;
  deleteComment(issueIdOrKey: string, commentId: string): Promise<void>;

  // Worklogs
  getWorklogs(
    issueIdOrKey: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<JiraWorklog>>;
  addWorklog(issueIdOrKey: string, params: AddWorklogParams): Promise<JiraWorklog>;
  updateWorklog(
    issueIdOrKey: string,
    worklogId: string,
    params: AddWorklogParams
  ): Promise<JiraWorklog>;
  deleteWorklog(issueIdOrKey: string, worklogId: string): Promise<void>;

  // Attachments
  getAttachments(issueIdOrKey: string): Promise<JiraAttachment[]>;
  deleteAttachment(attachmentId: string): Promise<void>;

  // Watchers
  getWatchers(issueIdOrKey: string): Promise<{ watchCount: number; watchers: JiraUser[] }>;
  addWatcher(issueIdOrKey: string, accountId: string): Promise<void>;
  removeWatcher(issueIdOrKey: string, accountId: string): Promise<void>;

  // Votes
  getVotes(issueIdOrKey: string): Promise<{ votes: number; hasVoted: boolean; voters: JiraUser[] }>;
  addVote(issueIdOrKey: string): Promise<void>;
  removeVote(issueIdOrKey: string): Promise<void>;

  // Projects
  listProjects(params?: ListProjectsParams): Promise<PaginatedResponse<JiraProject>>;
  getProject(projectIdOrKey: string, params?: GetProjectParams): Promise<JiraProject>;
  createProject(params: CreateProjectParams): Promise<JiraProject>;
  updateProject(projectIdOrKey: string, params: UpdateProjectParams): Promise<JiraProject>;
  deleteProject(projectIdOrKey: string): Promise<void>;
  getProjectRoles(projectIdOrKey: string): Promise<Record<string, string>>;
  getProjectRole(projectIdOrKey: string, roleId: number): Promise<JiraProjectRole>;

  // Components
  getProjectComponents(projectIdOrKey: string): Promise<JiraComponent[]>;
  getComponent(componentId: string): Promise<JiraComponent>;
  createComponent(params: CreateComponentParams): Promise<JiraComponent>;
  updateComponent(componentId: string, params: UpdateComponentParams): Promise<JiraComponent>;
  deleteComponent(componentId: string): Promise<void>;

  // Versions
  getProjectVersions(
    projectIdOrKey: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<JiraVersion>>;
  getVersion(versionId: string): Promise<JiraVersion>;
  createVersion(params: CreateVersionParams): Promise<JiraVersion>;
  updateVersion(versionId: string, params: UpdateVersionParams): Promise<JiraVersion>;
  deleteVersion(versionId: string): Promise<void>;
  releaseVersion(versionId: string): Promise<void>;

  // Issue Types
  getIssueTypes(): Promise<JiraIssueType[]>;
  getIssueTypesForProject(projectIdOrKey: string): Promise<JiraIssueType[]>;

  // Priorities
  getPriorities(): Promise<JiraPriority[]>;

  // Statuses
  getStatuses(): Promise<JiraStatus[]>;
  getStatusesForProject(projectIdOrKey: string): Promise<JiraStatus[]>;

  // Resolutions
  getResolutions(): Promise<JiraResolution[]>;

  // Fields
  getFields(): Promise<JiraField[]>;

  // Users
  getUser(accountId: string): Promise<JiraUser>;
  findUsers(params: FindUsersParams): Promise<JiraUser[]>;
  findAssignableUsers(params: FindAssignableUsersParams): Promise<JiraUser[]>;

  // Groups
  getGroups(params?: GetGroupsParams): Promise<PaginatedResponse<JiraGroup>>;
  getGroupMembers(
    groupName: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<JiraUser>>;

  // Filters
  getMyFilters(params?: GetFiltersParams): Promise<JiraFilter[]>;
  getFavouriteFilters(): Promise<JiraFilter[]>;
  getFilter(filterId: string): Promise<JiraFilter>;
  createFilter(params: CreateFilterParams): Promise<JiraFilter>;
  updateFilter(filterId: string, params: UpdateFilterParams): Promise<JiraFilter>;
  deleteFilter(filterId: string): Promise<void>;

  // Dashboards
  getDashboards(params?: GetDashboardsParams): Promise<PaginatedResponse<JiraDashboard>>;
  getDashboard(dashboardId: string): Promise<JiraDashboard>;

  // Boards (Agile)
  getBoards(params?: GetBoardsParams): Promise<PaginatedResponse<JiraBoard>>;
  getBoard(boardId: number): Promise<JiraBoard>;
  getBoardIssues(boardId: number, params?: GetBoardIssuesParams): Promise<JiraSearchResult>;
  getBacklogIssues(boardId: number, params?: GetBoardIssuesParams): Promise<JiraSearchResult>;

  // Sprints (Agile)
  getSprints(boardId: number, params?: GetSprintsParams): Promise<PaginatedResponse<JiraSprint>>;
  getSprint(sprintId: number): Promise<JiraSprint>;
  getSprintIssues(sprintId: number, params?: GetBoardIssuesParams): Promise<JiraSearchResult>;
  createSprint(params: CreateSprintParams): Promise<JiraSprint>;
  updateSprint(sprintId: number, params: UpdateSprintParams): Promise<JiraSprint>;
  deleteSprint(sprintId: number): Promise<void>;
  startSprint(sprintId: number, params: StartSprintParams): Promise<void>;
  completeSprint(sprintId: number, params: CompleteSprintParams): Promise<void>;
  moveIssuesToSprint(sprintId: number, issueKeys: string[]): Promise<void>;
  moveIssuesToBacklog(issueKeys: string[]): Promise<void>;

  // Epics (Agile)
  getEpics(boardId: number, params?: PaginationParams): Promise<PaginatedResponse<JiraEpic>>;
  getEpic(epicIdOrKey: string): Promise<JiraEpic>;
  getEpicIssues(epicIdOrKey: string, params?: GetBoardIssuesParams): Promise<JiraSearchResult>;
  moveIssuesToEpic(epicIdOrKey: string, issueKeys: string[]): Promise<void>;
  removeIssuesFromEpic(issueKeys: string[]): Promise<void>;

  // Server Info
  getServerInfo(): Promise<{
    baseUrl: string;
    version: string;
    buildNumber: number;
    serverTitle: string;
  }>;

  // Labels
  getLabels(params?: PaginationParams): Promise<PaginatedResponse<string>>;
}

// =============================================================================
// Parameter Types
// =============================================================================

interface PaginationParams {
  startAt?: number;
  maxResults?: number;
}

interface SearchIssuesParams extends PaginationParams {
  jql: string;
  fields?: string[];
  expand?: string[];
  validateQuery?: 'strict' | 'warn' | 'none';
}

interface GetIssueParams {
  fields?: string[];
  expand?: string[];
}

interface CreateIssueParams {
  projectKey: string;
  issueType: string;
  summary: string;
  description?: string | ADFDocument;
  priority?: string;
  assigneeId?: string;
  reporterId?: string;
  labels?: string[];
  components?: string[];
  fixVersions?: string[];
  dueDate?: string;
  parentKey?: string;
  customFields?: Record<string, unknown>;
}

interface UpdateIssueParams {
  summary?: string;
  description?: string | ADFDocument;
  priority?: string;
  assigneeId?: string;
  labels?: string[];
  components?: string[];
  fixVersions?: string[];
  dueDate?: string;
  customFields?: Record<string, unknown>;
}

interface TransitionIssueParams {
  transitionId: string;
  comment?: string | ADFDocument;
  resolution?: string;
  fields?: Record<string, unknown>;
}

interface CreateIssueLinkParams {
  type: string;
  inwardIssueKey: string;
  outwardIssueKey: string;
  comment?: string | ADFDocument;
}

interface AddWorklogParams {
  timeSpent?: string;
  timeSpentSeconds?: number;
  started?: string;
  comment?: string | ADFDocument;
}

interface ListProjectsParams extends PaginationParams {
  expand?: string[];
  recent?: number;
  typeKey?: string;
  categoryId?: number;
  searchQuery?: string;
  orderBy?: string;
}

interface GetProjectParams {
  expand?: string[];
}

interface CreateProjectParams {
  key: string;
  name: string;
  description?: string;
  leadAccountId?: string;
  projectTypeKey: string;
  projectTemplateKey?: string;
  assigneeType?: 'PROJECT_LEAD' | 'UNASSIGNED';
  categoryId?: number;
}

interface UpdateProjectParams {
  key?: string;
  name?: string;
  description?: string;
  leadAccountId?: string;
  assigneeType?: 'PROJECT_LEAD' | 'UNASSIGNED';
  categoryId?: number;
}

interface CreateComponentParams {
  project: string;
  name: string;
  description?: string;
  leadAccountId?: string;
  assigneeType?: string;
}

interface UpdateComponentParams {
  name?: string;
  description?: string;
  leadAccountId?: string;
  assigneeType?: string;
}

interface CreateVersionParams {
  projectId: number;
  name: string;
  description?: string;
  startDate?: string;
  releaseDate?: string;
  archived?: boolean;
  released?: boolean;
}

interface UpdateVersionParams {
  name?: string;
  description?: string;
  startDate?: string;
  releaseDate?: string;
  archived?: boolean;
  released?: boolean;
}

interface FindUsersParams {
  query?: string;
  accountId?: string;
  maxResults?: number;
  startAt?: number;
}

interface FindAssignableUsersParams {
  query?: string;
  projectKey?: string;
  issueKey?: string;
  maxResults?: number;
  startAt?: number;
}

interface GetGroupsParams extends PaginationParams {
  query?: string;
}

interface GetFiltersParams {
  expand?: string[];
}

interface CreateFilterParams {
  name: string;
  jql: string;
  description?: string;
  favourite?: boolean;
}

interface UpdateFilterParams {
  name?: string;
  jql?: string;
  description?: string;
  favourite?: boolean;
}

interface GetDashboardsParams extends PaginationParams {
  filter?: string;
}

interface GetBoardsParams extends PaginationParams {
  type?: 'scrum' | 'kanban' | 'simple';
  name?: string;
  projectKeyOrId?: string;
}

interface GetBoardIssuesParams extends PaginationParams {
  jql?: string;
  fields?: string[];
  expand?: string[];
}

interface GetSprintsParams extends PaginationParams {
  state?: 'future' | 'active' | 'closed';
}

interface CreateSprintParams {
  name: string;
  originBoardId: number;
  startDate?: string;
  endDate?: string;
  goal?: string;
}

interface UpdateSprintParams {
  name?: string;
  state?: 'future' | 'active' | 'closed';
  startDate?: string;
  endDate?: string;
  goal?: string;
}

interface StartSprintParams {
  startDate: string;
  endDate: string;
  goal?: string;
}

interface CompleteSprintParams {
  moveToSprintId?: number;
}

// =============================================================================
// Jira Client Implementation
// =============================================================================

class JiraClientImpl implements JiraClient {
  private credentials: TenantCredentials;

  constructor(credentials: TenantCredentials) {
    this.credentials = credentials;
  }

  // ===========================================================================
  // URL Helpers
  // ===========================================================================

  private getBaseUrl(): string {
    return `https://${this.credentials.domain}.atlassian.net/rest/api/3`;
  }

  private getAgileUrl(): string {
    return `https://${this.credentials.domain}.atlassian.net/rest/agile/1.0`;
  }

  // ===========================================================================
  // Auth Helpers
  // ===========================================================================

  private getAuthHeaders(): Record<string, string> {
    // OAuth 2.0 access token (preferred)
    if (this.credentials.accessToken) {
      return {
        Authorization: `Bearer ${this.credentials.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
    }

    // Basic Auth (email + API token)
    if (this.credentials.email && this.credentials.apiToken) {
      const credentials = btoa(`${this.credentials.email}:${this.credentials.apiToken}`);
      return {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
    }

    throw new AuthenticationError(
      'No credentials provided. Include X-Jira-Email + X-Jira-API-Token or X-Jira-Access-Token header.'
    );
  }

  // ===========================================================================
  // Request Helper
  // ===========================================================================

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useAgile = false
  ): Promise<T> {
    const baseUrl = useAgile ? this.getAgileUrl() : this.getBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError('Rate limit exceeded', retryAfter ? Number.parseInt(retryAfter, 10) : 60);
    }

    // Handle authentication errors
    if (response.status === 401) {
      throw new AuthenticationError('Authentication failed. Check your credentials.');
    }

    if (response.status === 403) {
      throw new JiraApiError('Permission denied. Check your access rights.', 403);
    }

    // Handle other errors
    if (!response.ok) {
      const errorBody = await response.text();
      let message = `Jira API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        if (errorJson.errorMessages?.length > 0) {
          message = errorJson.errorMessages.join('; ');
        } else if (errorJson.errors) {
          message = Object.entries(errorJson.errors)
            .map(([k, v]) => `${k}: ${v}`)
            .join('; ');
        } else if (errorJson.message) {
          message = errorJson.message;
        }
      } catch {
        // Use default message
      }
      throw new JiraApiError(message, response.status);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  // ===========================================================================
  // ADF Helper
  // ===========================================================================

  private toADF(text: string | ADFDocument): ADFDocument {
    if (typeof text === 'object' && text.type === 'doc') {
      return text;
    }
    return {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: text as string }],
        },
      ],
    };
  }

  // ===========================================================================
  // Connection
  // ===========================================================================

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      const myself = await this.getMyself();
      return {
        connected: true,
        message: `Connected as ${myself.displayName} (${myself.emailAddress || myself.accountId})`,
      };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  async getMyself(): Promise<JiraMyself> {
    return this.request<JiraMyself>('/myself');
  }

  // ===========================================================================
  // Issues
  // ===========================================================================

  async searchIssues(params: SearchIssuesParams): Promise<JiraSearchResult> {
    return this.request<JiraSearchResult>('/search', {
      method: 'POST',
      body: JSON.stringify({
        jql: params.jql,
        startAt: params.startAt || 0,
        maxResults: params.maxResults || 50,
        fields: params.fields || [
          'summary',
          'status',
          'priority',
          'assignee',
          'reporter',
          'project',
          'issuetype',
          'created',
          'updated',
          'labels',
          'components',
        ],
        expand: params.expand,
        validateQuery: params.validateQuery,
      }),
    });
  }

  async getIssue(issueIdOrKey: string, params?: GetIssueParams): Promise<JiraIssue> {
    const queryParams = new URLSearchParams();
    if (params?.fields) queryParams.set('fields', params.fields.join(','));
    if (params?.expand) queryParams.set('expand', params.expand.join(','));
    const query = queryParams.toString();
    return this.request<JiraIssue>(`/issue/${issueIdOrKey}${query ? `?${query}` : ''}`);
  }

  async createIssue(params: CreateIssueParams): Promise<{ id: string; key: string; self: string }> {
    const fields: Record<string, unknown> = {
      project: { key: params.projectKey },
      issuetype: { name: params.issueType },
      summary: params.summary,
    };

    if (params.description) {
      fields.description =
        typeof params.description === 'string' ? this.toADF(params.description) : params.description;
    }
    if (params.priority) fields.priority = { name: params.priority };
    if (params.assigneeId) fields.assignee = { accountId: params.assigneeId };
    if (params.reporterId) fields.reporter = { accountId: params.reporterId };
    if (params.labels) fields.labels = params.labels;
    if (params.components) fields.components = params.components.map((name) => ({ name }));
    if (params.fixVersions) fields.fixVersions = params.fixVersions.map((name) => ({ name }));
    if (params.dueDate) fields.duedate = params.dueDate;
    if (params.parentKey) fields.parent = { key: params.parentKey };
    if (params.customFields) {
      Object.assign(fields, params.customFields);
    }

    return this.request<{ id: string; key: string; self: string }>('/issue', {
      method: 'POST',
      body: JSON.stringify({ fields }),
    });
  }

  async updateIssue(issueIdOrKey: string, params: UpdateIssueParams): Promise<void> {
    const fields: Record<string, unknown> = {};

    if (params.summary !== undefined) fields.summary = params.summary;
    if (params.description !== undefined) {
      fields.description =
        typeof params.description === 'string' ? this.toADF(params.description) : params.description;
    }
    if (params.priority !== undefined) fields.priority = { name: params.priority };
    if (params.assigneeId !== undefined) {
      fields.assignee = params.assigneeId ? { accountId: params.assigneeId } : null;
    }
    if (params.labels !== undefined) fields.labels = params.labels;
    if (params.components !== undefined) {
      fields.components = params.components.map((name) => ({ name }));
    }
    if (params.fixVersions !== undefined) {
      fields.fixVersions = params.fixVersions.map((name) => ({ name }));
    }
    if (params.dueDate !== undefined) fields.duedate = params.dueDate;
    if (params.customFields) {
      Object.assign(fields, params.customFields);
    }

    await this.request(`/issue/${issueIdOrKey}`, {
      method: 'PUT',
      body: JSON.stringify({ fields }),
    });
  }

  async deleteIssue(issueIdOrKey: string, deleteSubtasks = false): Promise<void> {
    await this.request(`/issue/${issueIdOrKey}?deleteSubtasks=${deleteSubtasks}`, {
      method: 'DELETE',
    });
  }

  async assignIssue(issueIdOrKey: string, accountId: string | null): Promise<void> {
    await this.request(`/issue/${issueIdOrKey}/assignee`, {
      method: 'PUT',
      body: JSON.stringify({ accountId }),
    });
  }

  async getTransitions(issueIdOrKey: string): Promise<JiraTransition[]> {
    const response = await this.request<{ transitions: JiraTransition[] }>(
      `/issue/${issueIdOrKey}/transitions?expand=transitions.fields`
    );
    return response.transitions;
  }

  async transitionIssue(issueIdOrKey: string, params: TransitionIssueParams): Promise<void> {
    const body: Record<string, unknown> = {
      transition: { id: params.transitionId },
    };

    if (params.fields) {
      body.fields = params.fields;
    }

    if (params.resolution) {
      body.fields = { ...(body.fields as Record<string, unknown>), resolution: { name: params.resolution } };
    }

    if (params.comment) {
      body.update = {
        comment: [
          {
            add: {
              body: typeof params.comment === 'string' ? this.toADF(params.comment) : params.comment,
            },
          },
        ],
      };
    }

    await this.request(`/issue/${issueIdOrKey}/transitions`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getChangelog(
    issueIdOrKey: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<JiraChangelogEntry>> {
    const queryParams = new URLSearchParams();
    if (params?.startAt) queryParams.set('startAt', String(params.startAt));
    if (params?.maxResults) queryParams.set('maxResults', String(params.maxResults));

    const response = await this.request<{
      startAt: number;
      maxResults: number;
      total: number;
      values: JiraChangelogEntry[];
    }>(`/issue/${issueIdOrKey}/changelog?${queryParams}`);

    return {
      items: response.values,
      count: response.values.length,
      total: response.total,
      startAt: response.startAt,
      maxResults: response.maxResults,
      hasMore: response.startAt + response.values.length < response.total,
    };
  }

  // ===========================================================================
  // Issue Links
  // ===========================================================================

  async createIssueLink(params: CreateIssueLinkParams): Promise<void> {
    const body: Record<string, unknown> = {
      type: { name: params.type },
      inwardIssue: { key: params.inwardIssueKey },
      outwardIssue: { key: params.outwardIssueKey },
    };

    if (params.comment) {
      body.comment = {
        body: typeof params.comment === 'string' ? this.toADF(params.comment) : params.comment,
      };
    }

    await this.request('/issueLink', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async deleteIssueLink(linkId: string): Promise<void> {
    await this.request(`/issueLink/${linkId}`, { method: 'DELETE' });
  }

  async getIssueLinkTypes(): Promise<JiraIssueLinkType[]> {
    const response = await this.request<{ issueLinkTypes: JiraIssueLinkType[] }>('/issueLinkType');
    return response.issueLinkTypes;
  }

  // ===========================================================================
  // Comments
  // ===========================================================================

  async getComments(
    issueIdOrKey: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<JiraComment>> {
    const queryParams = new URLSearchParams();
    if (params?.startAt) queryParams.set('startAt', String(params.startAt));
    if (params?.maxResults) queryParams.set('maxResults', String(params.maxResults));

    const response = await this.request<{
      startAt: number;
      maxResults: number;
      total: number;
      comments: JiraComment[];
    }>(`/issue/${issueIdOrKey}/comment?${queryParams}`);

    return {
      items: response.comments,
      count: response.comments.length,
      total: response.total,
      startAt: response.startAt,
      maxResults: response.maxResults,
      hasMore: response.startAt + response.comments.length < response.total,
    };
  }

  async getComment(issueIdOrKey: string, commentId: string): Promise<JiraComment> {
    return this.request<JiraComment>(`/issue/${issueIdOrKey}/comment/${commentId}`);
  }

  async addComment(issueIdOrKey: string, body: string | ADFDocument): Promise<JiraComment> {
    return this.request<JiraComment>(`/issue/${issueIdOrKey}/comment`, {
      method: 'POST',
      body: JSON.stringify({
        body: typeof body === 'string' ? this.toADF(body) : body,
      }),
    });
  }

  async updateComment(
    issueIdOrKey: string,
    commentId: string,
    body: string | ADFDocument
  ): Promise<JiraComment> {
    return this.request<JiraComment>(`/issue/${issueIdOrKey}/comment/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({
        body: typeof body === 'string' ? this.toADF(body) : body,
      }),
    });
  }

  async deleteComment(issueIdOrKey: string, commentId: string): Promise<void> {
    await this.request(`/issue/${issueIdOrKey}/comment/${commentId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Worklogs
  // ===========================================================================

  async getWorklogs(
    issueIdOrKey: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<JiraWorklog>> {
    const queryParams = new URLSearchParams();
    if (params?.startAt) queryParams.set('startAt', String(params.startAt));
    if (params?.maxResults) queryParams.set('maxResults', String(params.maxResults));

    const response = await this.request<{
      startAt: number;
      maxResults: number;
      total: number;
      worklogs: JiraWorklog[];
    }>(`/issue/${issueIdOrKey}/worklog?${queryParams}`);

    return {
      items: response.worklogs,
      count: response.worklogs.length,
      total: response.total,
      startAt: response.startAt,
      maxResults: response.maxResults,
      hasMore: response.startAt + response.worklogs.length < response.total,
    };
  }

  async addWorklog(issueIdOrKey: string, params: AddWorklogParams): Promise<JiraWorklog> {
    const body: Record<string, unknown> = {};
    if (params.timeSpent) body.timeSpent = params.timeSpent;
    if (params.timeSpentSeconds) body.timeSpentSeconds = params.timeSpentSeconds;
    if (params.started) body.started = params.started;
    if (params.comment) {
      body.comment = typeof params.comment === 'string' ? this.toADF(params.comment) : params.comment;
    }

    return this.request<JiraWorklog>(`/issue/${issueIdOrKey}/worklog`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async updateWorklog(
    issueIdOrKey: string,
    worklogId: string,
    params: AddWorklogParams
  ): Promise<JiraWorklog> {
    const body: Record<string, unknown> = {};
    if (params.timeSpent) body.timeSpent = params.timeSpent;
    if (params.timeSpentSeconds) body.timeSpentSeconds = params.timeSpentSeconds;
    if (params.started) body.started = params.started;
    if (params.comment) {
      body.comment = typeof params.comment === 'string' ? this.toADF(params.comment) : params.comment;
    }

    return this.request<JiraWorklog>(`/issue/${issueIdOrKey}/worklog/${worklogId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async deleteWorklog(issueIdOrKey: string, worklogId: string): Promise<void> {
    await this.request(`/issue/${issueIdOrKey}/worklog/${worklogId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Attachments
  // ===========================================================================

  async getAttachments(issueIdOrKey: string): Promise<JiraAttachment[]> {
    const issue = await this.getIssue(issueIdOrKey, { fields: ['attachment'] });
    return issue.fields.attachment || [];
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    await this.request(`/attachment/${attachmentId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Watchers
  // ===========================================================================

  async getWatchers(issueIdOrKey: string): Promise<{ watchCount: number; watchers: JiraUser[] }> {
    const response = await this.request<{
      self: string;
      isWatching: boolean;
      watchCount: number;
      watchers: JiraUser[];
    }>(`/issue/${issueIdOrKey}/watchers`);
    return { watchCount: response.watchCount, watchers: response.watchers };
  }

  async addWatcher(issueIdOrKey: string, accountId: string): Promise<void> {
    await this.request(`/issue/${issueIdOrKey}/watchers`, {
      method: 'POST',
      body: JSON.stringify(accountId),
    });
  }

  async removeWatcher(issueIdOrKey: string, accountId: string): Promise<void> {
    await this.request(`/issue/${issueIdOrKey}/watchers?accountId=${accountId}`, {
      method: 'DELETE',
    });
  }

  // ===========================================================================
  // Votes
  // ===========================================================================

  async getVotes(
    issueIdOrKey: string
  ): Promise<{ votes: number; hasVoted: boolean; voters: JiraUser[] }> {
    const response = await this.request<{
      self: string;
      votes: number;
      hasVoted: boolean;
      voters: JiraUser[];
    }>(`/issue/${issueIdOrKey}/votes`);
    return { votes: response.votes, hasVoted: response.hasVoted, voters: response.voters };
  }

  async addVote(issueIdOrKey: string): Promise<void> {
    await this.request(`/issue/${issueIdOrKey}/votes`, { method: 'POST' });
  }

  async removeVote(issueIdOrKey: string): Promise<void> {
    await this.request(`/issue/${issueIdOrKey}/votes`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Projects
  // ===========================================================================

  async listProjects(params?: ListProjectsParams): Promise<PaginatedResponse<JiraProject>> {
    const queryParams = new URLSearchParams();
    if (params?.startAt) queryParams.set('startAt', String(params.startAt));
    if (params?.maxResults) queryParams.set('maxResults', String(params.maxResults));
    if (params?.expand) queryParams.set('expand', params.expand.join(','));
    if (params?.recent) queryParams.set('recent', String(params.recent));
    if (params?.typeKey) queryParams.set('typeKey', params.typeKey);
    if (params?.categoryId) queryParams.set('categoryId', String(params.categoryId));
    if (params?.searchQuery) queryParams.set('query', params.searchQuery);
    if (params?.orderBy) queryParams.set('orderBy', params.orderBy);

    const response = await this.request<{
      startAt: number;
      maxResults: number;
      total: number;
      values: JiraProject[];
    }>(`/project/search?${queryParams}`);

    return {
      items: response.values,
      count: response.values.length,
      total: response.total,
      startAt: response.startAt,
      maxResults: response.maxResults,
      hasMore: response.startAt + response.values.length < response.total,
    };
  }

  async getProject(projectIdOrKey: string, params?: GetProjectParams): Promise<JiraProject> {
    const queryParams = new URLSearchParams();
    if (params?.expand) queryParams.set('expand', params.expand.join(','));
    const query = queryParams.toString();
    return this.request<JiraProject>(`/project/${projectIdOrKey}${query ? `?${query}` : ''}`);
  }

  async createProject(params: CreateProjectParams): Promise<JiraProject> {
    return this.request<JiraProject>('/project', {
      method: 'POST',
      body: JSON.stringify({
        key: params.key,
        name: params.name,
        description: params.description,
        leadAccountId: params.leadAccountId,
        projectTypeKey: params.projectTypeKey,
        projectTemplateKey: params.projectTemplateKey,
        assigneeType: params.assigneeType,
        categoryId: params.categoryId,
      }),
    });
  }

  async updateProject(projectIdOrKey: string, params: UpdateProjectParams): Promise<JiraProject> {
    return this.request<JiraProject>(`/project/${projectIdOrKey}`, {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  }

  async deleteProject(projectIdOrKey: string): Promise<void> {
    await this.request(`/project/${projectIdOrKey}`, { method: 'DELETE' });
  }

  async getProjectRoles(projectIdOrKey: string): Promise<Record<string, string>> {
    return this.request<Record<string, string>>(`/project/${projectIdOrKey}/role`);
  }

  async getProjectRole(projectIdOrKey: string, roleId: number): Promise<JiraProjectRole> {
    return this.request<JiraProjectRole>(`/project/${projectIdOrKey}/role/${roleId}`);
  }

  // ===========================================================================
  // Components
  // ===========================================================================

  async getProjectComponents(projectIdOrKey: string): Promise<JiraComponent[]> {
    return this.request<JiraComponent[]>(`/project/${projectIdOrKey}/components`);
  }

  async getComponent(componentId: string): Promise<JiraComponent> {
    return this.request<JiraComponent>(`/component/${componentId}`);
  }

  async createComponent(params: CreateComponentParams): Promise<JiraComponent> {
    return this.request<JiraComponent>('/component', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async updateComponent(componentId: string, params: UpdateComponentParams): Promise<JiraComponent> {
    return this.request<JiraComponent>(`/component/${componentId}`, {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  }

  async deleteComponent(componentId: string): Promise<void> {
    await this.request(`/component/${componentId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Versions
  // ===========================================================================

  async getProjectVersions(
    projectIdOrKey: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<JiraVersion>> {
    const queryParams = new URLSearchParams();
    if (params?.startAt) queryParams.set('startAt', String(params.startAt));
    if (params?.maxResults) queryParams.set('maxResults', String(params.maxResults));

    const response = await this.request<{
      startAt: number;
      maxResults: number;
      total: number;
      values: JiraVersion[];
    }>(`/project/${projectIdOrKey}/version?${queryParams}`);

    return {
      items: response.values,
      count: response.values.length,
      total: response.total,
      startAt: response.startAt,
      maxResults: response.maxResults,
      hasMore: response.startAt + response.values.length < response.total,
    };
  }

  async getVersion(versionId: string): Promise<JiraVersion> {
    return this.request<JiraVersion>(`/version/${versionId}`);
  }

  async createVersion(params: CreateVersionParams): Promise<JiraVersion> {
    return this.request<JiraVersion>('/version', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async updateVersion(versionId: string, params: UpdateVersionParams): Promise<JiraVersion> {
    return this.request<JiraVersion>(`/version/${versionId}`, {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  }

  async deleteVersion(versionId: string): Promise<void> {
    await this.request(`/version/${versionId}`, { method: 'DELETE' });
  }

  async releaseVersion(versionId: string): Promise<void> {
    await this.request(`/version/${versionId}`, {
      method: 'PUT',
      body: JSON.stringify({ released: true }),
    });
  }

  // ===========================================================================
  // Issue Types
  // ===========================================================================

  async getIssueTypes(): Promise<JiraIssueType[]> {
    return this.request<JiraIssueType[]>('/issuetype');
  }

  async getIssueTypesForProject(projectIdOrKey: string): Promise<JiraIssueType[]> {
    return this.request<JiraIssueType[]>(`/issuetype/project?projectId=${projectIdOrKey}`);
  }

  // ===========================================================================
  // Priorities
  // ===========================================================================

  async getPriorities(): Promise<JiraPriority[]> {
    return this.request<JiraPriority[]>('/priority');
  }

  // ===========================================================================
  // Statuses
  // ===========================================================================

  async getStatuses(): Promise<JiraStatus[]> {
    return this.request<JiraStatus[]>('/status');
  }

  async getStatusesForProject(projectIdOrKey: string): Promise<JiraStatus[]> {
    const response = await this.request<
      Array<{ name: string; statuses: JiraStatus[] }>
    >(`/project/${projectIdOrKey}/statuses`);
    const statusMap = new Map<string, JiraStatus>();
    for (const issueType of response) {
      for (const status of issueType.statuses) {
        statusMap.set(status.id, status);
      }
    }
    return Array.from(statusMap.values());
  }

  // ===========================================================================
  // Resolutions
  // ===========================================================================

  async getResolutions(): Promise<JiraResolution[]> {
    return this.request<JiraResolution[]>('/resolution');
  }

  // ===========================================================================
  // Fields
  // ===========================================================================

  async getFields(): Promise<JiraField[]> {
    return this.request<JiraField[]>('/field');
  }

  // ===========================================================================
  // Users
  // ===========================================================================

  async getUser(accountId: string): Promise<JiraUser> {
    return this.request<JiraUser>(`/user?accountId=${accountId}`);
  }

  async findUsers(params: FindUsersParams): Promise<JiraUser[]> {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.set('query', params.query);
    if (params.accountId) queryParams.set('accountId', params.accountId);
    if (params.maxResults) queryParams.set('maxResults', String(params.maxResults));
    if (params.startAt) queryParams.set('startAt', String(params.startAt));

    return this.request<JiraUser[]>(`/user/search?${queryParams}`);
  }

  async findAssignableUsers(params: FindAssignableUsersParams): Promise<JiraUser[]> {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.set('query', params.query);
    if (params.projectKey) queryParams.set('project', params.projectKey);
    if (params.issueKey) queryParams.set('issueKey', params.issueKey);
    if (params.maxResults) queryParams.set('maxResults', String(params.maxResults));
    if (params.startAt) queryParams.set('startAt', String(params.startAt));

    return this.request<JiraUser[]>(`/user/assignable/search?${queryParams}`);
  }

  // ===========================================================================
  // Groups
  // ===========================================================================

  async getGroups(params?: GetGroupsParams): Promise<PaginatedResponse<JiraGroup>> {
    const queryParams = new URLSearchParams();
    if (params?.query) queryParams.set('query', params.query);
    if (params?.startAt) queryParams.set('startAt', String(params.startAt));
    if (params?.maxResults) queryParams.set('maxResults', String(params.maxResults));

    const response = await this.request<{
      maxResults: number;
      startAt: number;
      total: number;
      groups: JiraGroup[];
    }>(`/groups/picker?${queryParams}`);

    return {
      items: response.groups,
      count: response.groups.length,
      total: response.total,
      startAt: response.startAt,
      maxResults: response.maxResults,
      hasMore: response.startAt + response.groups.length < response.total,
    };
  }

  async getGroupMembers(
    groupName: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<JiraUser>> {
    const queryParams = new URLSearchParams();
    queryParams.set('groupname', groupName);
    if (params?.startAt) queryParams.set('startAt', String(params.startAt));
    if (params?.maxResults) queryParams.set('maxResults', String(params.maxResults));

    const response = await this.request<{
      maxResults: number;
      startAt: number;
      total: number;
      values: JiraUser[];
    }>(`/group/member?${queryParams}`);

    return {
      items: response.values,
      count: response.values.length,
      total: response.total,
      startAt: response.startAt,
      maxResults: response.maxResults,
      hasMore: response.startAt + response.values.length < response.total,
    };
  }

  // ===========================================================================
  // Filters
  // ===========================================================================

  async getMyFilters(params?: GetFiltersParams): Promise<JiraFilter[]> {
    const queryParams = new URLSearchParams();
    if (params?.expand) queryParams.set('expand', params.expand.join(','));
    return this.request<JiraFilter[]>(`/filter/my?${queryParams}`);
  }

  async getFavouriteFilters(): Promise<JiraFilter[]> {
    return this.request<JiraFilter[]>('/filter/favourite');
  }

  async getFilter(filterId: string): Promise<JiraFilter> {
    return this.request<JiraFilter>(`/filter/${filterId}`);
  }

  async createFilter(params: CreateFilterParams): Promise<JiraFilter> {
    return this.request<JiraFilter>('/filter', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async updateFilter(filterId: string, params: UpdateFilterParams): Promise<JiraFilter> {
    return this.request<JiraFilter>(`/filter/${filterId}`, {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  }

  async deleteFilter(filterId: string): Promise<void> {
    await this.request(`/filter/${filterId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Dashboards
  // ===========================================================================

  async getDashboards(params?: GetDashboardsParams): Promise<PaginatedResponse<JiraDashboard>> {
    const queryParams = new URLSearchParams();
    if (params?.startAt) queryParams.set('startAt', String(params.startAt));
    if (params?.maxResults) queryParams.set('maxResults', String(params.maxResults));
    if (params?.filter) queryParams.set('filter', params.filter);

    const response = await this.request<{
      startAt: number;
      maxResults: number;
      total: number;
      dashboards: JiraDashboard[];
    }>(`/dashboard?${queryParams}`);

    return {
      items: response.dashboards,
      count: response.dashboards.length,
      total: response.total,
      startAt: response.startAt,
      maxResults: response.maxResults,
      hasMore: response.startAt + response.dashboards.length < response.total,
    };
  }

  async getDashboard(dashboardId: string): Promise<JiraDashboard> {
    return this.request<JiraDashboard>(`/dashboard/${dashboardId}`);
  }

  // ===========================================================================
  // Boards (Agile)
  // ===========================================================================

  async getBoards(params?: GetBoardsParams): Promise<PaginatedResponse<JiraBoard>> {
    const queryParams = new URLSearchParams();
    if (params?.startAt) queryParams.set('startAt', String(params.startAt));
    if (params?.maxResults) queryParams.set('maxResults', String(params.maxResults));
    if (params?.type) queryParams.set('type', params.type);
    if (params?.name) queryParams.set('name', params.name);
    if (params?.projectKeyOrId) queryParams.set('projectKeyOrId', params.projectKeyOrId);

    const response = await this.request<{
      startAt: number;
      maxResults: number;
      total: number;
      values: JiraBoard[];
    }>(`/board?${queryParams}`, {}, true);

    return {
      items: response.values,
      count: response.values.length,
      total: response.total,
      startAt: response.startAt,
      maxResults: response.maxResults,
      hasMore: response.startAt + response.values.length < response.total,
    };
  }

  async getBoard(boardId: number): Promise<JiraBoard> {
    return this.request<JiraBoard>(`/board/${boardId}`, {}, true);
  }

  async getBoardIssues(boardId: number, params?: GetBoardIssuesParams): Promise<JiraSearchResult> {
    const queryParams = new URLSearchParams();
    if (params?.startAt) queryParams.set('startAt', String(params.startAt));
    if (params?.maxResults) queryParams.set('maxResults', String(params.maxResults));
    if (params?.jql) queryParams.set('jql', params.jql);
    if (params?.fields) queryParams.set('fields', params.fields.join(','));
    if (params?.expand) queryParams.set('expand', params.expand.join(','));

    return this.request<JiraSearchResult>(`/board/${boardId}/issue?${queryParams}`, {}, true);
  }

  async getBacklogIssues(boardId: number, params?: GetBoardIssuesParams): Promise<JiraSearchResult> {
    const queryParams = new URLSearchParams();
    if (params?.startAt) queryParams.set('startAt', String(params.startAt));
    if (params?.maxResults) queryParams.set('maxResults', String(params.maxResults));
    if (params?.jql) queryParams.set('jql', params.jql);
    if (params?.fields) queryParams.set('fields', params.fields.join(','));
    if (params?.expand) queryParams.set('expand', params.expand.join(','));

    return this.request<JiraSearchResult>(`/board/${boardId}/backlog?${queryParams}`, {}, true);
  }

  // ===========================================================================
  // Sprints (Agile)
  // ===========================================================================

  async getSprints(boardId: number, params?: GetSprintsParams): Promise<PaginatedResponse<JiraSprint>> {
    const queryParams = new URLSearchParams();
    if (params?.startAt) queryParams.set('startAt', String(params.startAt));
    if (params?.maxResults) queryParams.set('maxResults', String(params.maxResults));
    if (params?.state) queryParams.set('state', params.state);

    const response = await this.request<{
      startAt: number;
      maxResults: number;
      total: number;
      values: JiraSprint[];
    }>(`/board/${boardId}/sprint?${queryParams}`, {}, true);

    return {
      items: response.values,
      count: response.values.length,
      total: response.total,
      startAt: response.startAt,
      maxResults: response.maxResults,
      hasMore: response.startAt + response.values.length < response.total,
    };
  }

  async getSprint(sprintId: number): Promise<JiraSprint> {
    return this.request<JiraSprint>(`/sprint/${sprintId}`, {}, true);
  }

  async getSprintIssues(sprintId: number, params?: GetBoardIssuesParams): Promise<JiraSearchResult> {
    const queryParams = new URLSearchParams();
    if (params?.startAt) queryParams.set('startAt', String(params.startAt));
    if (params?.maxResults) queryParams.set('maxResults', String(params.maxResults));
    if (params?.jql) queryParams.set('jql', params.jql);
    if (params?.fields) queryParams.set('fields', params.fields.join(','));
    if (params?.expand) queryParams.set('expand', params.expand.join(','));

    return this.request<JiraSearchResult>(`/sprint/${sprintId}/issue?${queryParams}`, {}, true);
  }

  async createSprint(params: CreateSprintParams): Promise<JiraSprint> {
    return this.request<JiraSprint>('/sprint', {
      method: 'POST',
      body: JSON.stringify(params),
    }, true);
  }

  async updateSprint(sprintId: number, params: UpdateSprintParams): Promise<JiraSprint> {
    return this.request<JiraSprint>(`/sprint/${sprintId}`, {
      method: 'PUT',
      body: JSON.stringify(params),
    }, true);
  }

  async deleteSprint(sprintId: number): Promise<void> {
    await this.request(`/sprint/${sprintId}`, { method: 'DELETE' }, true);
  }

  async startSprint(sprintId: number, params: StartSprintParams): Promise<void> {
    await this.request(`/sprint/${sprintId}`, {
      method: 'POST',
      body: JSON.stringify({
        state: 'active',
        startDate: params.startDate,
        endDate: params.endDate,
        goal: params.goal,
      }),
    }, true);
  }

  async completeSprint(sprintId: number, params: CompleteSprintParams): Promise<void> {
    const body: Record<string, unknown> = { state: 'closed' };
    if (params.moveToSprintId) {
      body.completeSprintId = params.moveToSprintId;
    }
    await this.request(`/sprint/${sprintId}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }, true);
  }

  async moveIssuesToSprint(sprintId: number, issueKeys: string[]): Promise<void> {
    await this.request(`/sprint/${sprintId}/issue`, {
      method: 'POST',
      body: JSON.stringify({ issues: issueKeys }),
    }, true);
  }

  async moveIssuesToBacklog(issueKeys: string[]): Promise<void> {
    await this.request('/backlog/issue', {
      method: 'POST',
      body: JSON.stringify({ issues: issueKeys }),
    }, true);
  }

  // ===========================================================================
  // Epics (Agile)
  // ===========================================================================

  async getEpics(boardId: number, params?: PaginationParams): Promise<PaginatedResponse<JiraEpic>> {
    const queryParams = new URLSearchParams();
    if (params?.startAt) queryParams.set('startAt', String(params.startAt));
    if (params?.maxResults) queryParams.set('maxResults', String(params.maxResults));

    const response = await this.request<{
      startAt: number;
      maxResults: number;
      total: number;
      values: JiraEpic[];
    }>(`/board/${boardId}/epic?${queryParams}`, {}, true);

    return {
      items: response.values,
      count: response.values.length,
      total: response.total,
      startAt: response.startAt,
      maxResults: response.maxResults,
      hasMore: response.startAt + response.values.length < response.total,
    };
  }

  async getEpic(epicIdOrKey: string): Promise<JiraEpic> {
    return this.request<JiraEpic>(`/epic/${epicIdOrKey}`, {}, true);
  }

  async getEpicIssues(epicIdOrKey: string, params?: GetBoardIssuesParams): Promise<JiraSearchResult> {
    const queryParams = new URLSearchParams();
    if (params?.startAt) queryParams.set('startAt', String(params.startAt));
    if (params?.maxResults) queryParams.set('maxResults', String(params.maxResults));
    if (params?.jql) queryParams.set('jql', params.jql);
    if (params?.fields) queryParams.set('fields', params.fields.join(','));
    if (params?.expand) queryParams.set('expand', params.expand.join(','));

    return this.request<JiraSearchResult>(`/epic/${epicIdOrKey}/issue?${queryParams}`, {}, true);
  }

  async moveIssuesToEpic(epicIdOrKey: string, issueKeys: string[]): Promise<void> {
    await this.request(`/epic/${epicIdOrKey}/issue`, {
      method: 'POST',
      body: JSON.stringify({ issues: issueKeys }),
    }, true);
  }

  async removeIssuesFromEpic(issueKeys: string[]): Promise<void> {
    await this.request('/epic/none/issue', {
      method: 'POST',
      body: JSON.stringify({ issues: issueKeys }),
    }, true);
  }

  // ===========================================================================
  // Server Info
  // ===========================================================================

  async getServerInfo(): Promise<{
    baseUrl: string;
    version: string;
    buildNumber: number;
    serverTitle: string;
  }> {
    return this.request<{
      baseUrl: string;
      version: string;
      buildNumber: number;
      serverTitle: string;
    }>('/serverInfo');
  }

  // ===========================================================================
  // Labels
  // ===========================================================================

  async getLabels(params?: PaginationParams): Promise<PaginatedResponse<string>> {
    const queryParams = new URLSearchParams();
    if (params?.startAt) queryParams.set('startAt', String(params.startAt));
    if (params?.maxResults) queryParams.set('maxResults', String(params.maxResults));

    const response = await this.request<{
      startAt: number;
      maxResults: number;
      total: number;
      values: string[];
    }>(`/label?${queryParams}`);

    return {
      items: response.values,
      count: response.values.length,
      total: response.total,
      startAt: response.startAt,
      maxResults: response.maxResults,
      hasMore: response.startAt + response.values.length < response.total,
    };
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a Jira client instance with tenant-specific credentials.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
export function createJiraClient(credentials: TenantCredentials): JiraClient {
  return new JiraClientImpl(credentials);
}
