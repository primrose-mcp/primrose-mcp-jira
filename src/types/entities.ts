/**
 * Jira Entity Types
 *
 * Type definitions for Jira Cloud API entities.
 */

// =============================================================================
// Common Types
// =============================================================================

export type ResponseFormat = 'json' | 'markdown';

export interface PaginationParams {
  startAt?: number;
  maxResults?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  count: number;
  total?: number;
  startAt: number;
  maxResults: number;
  hasMore: boolean;
  nextCursor?: string;
}

// =============================================================================
// ADF (Atlassian Document Format)
// =============================================================================

export interface ADFDocument {
  type: 'doc';
  version: 1;
  content: ADFNode[];
}

export interface ADFNode {
  type: string;
  content?: ADFNode[];
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
}

// =============================================================================
// User Types
// =============================================================================

export interface JiraUser {
  accountId: string;
  emailAddress?: string;
  displayName: string;
  active: boolean;
  avatarUrls?: {
    '48x48'?: string;
    '24x24'?: string;
    '16x16'?: string;
    '32x32'?: string;
  };
  timeZone?: string;
  locale?: string;
}

// =============================================================================
// Project Types
// =============================================================================

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  description?: string;
  projectTypeKey: string;
  simplified?: boolean;
  style?: string;
  lead?: JiraUser;
  avatarUrls?: Record<string, string>;
  projectCategory?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface JiraProjectRole {
  id: number;
  name: string;
  description?: string;
  actors?: Array<{
    id: number;
    displayName: string;
    type: string;
    actorUser?: JiraUser;
  }>;
}

// =============================================================================
// Issue Types
// =============================================================================

export interface JiraIssueType {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  subtask: boolean;
  hierarchyLevel?: number;
}

export interface JiraPriority {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  statusColor?: string;
}

export interface JiraStatus {
  id: string;
  name: string;
  description?: string;
  statusCategory: {
    id: number;
    key: string;
    name: string;
    colorName: string;
  };
}

export interface JiraResolution {
  id: string;
  name: string;
  description?: string;
}

export interface JiraComponent {
  id: string;
  name: string;
  description?: string;
  lead?: JiraUser;
  assigneeType?: string;
  project?: string;
  projectId?: number;
}

export interface JiraVersion {
  id: string;
  name: string;
  description?: string;
  archived: boolean;
  released: boolean;
  releaseDate?: string;
  startDate?: string;
  projectId?: number;
}

export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: {
    summary: string;
    description?: ADFDocument | null;
    status: JiraStatus;
    priority?: JiraPriority;
    issuetype: JiraIssueType;
    assignee?: JiraUser | null;
    reporter?: JiraUser | null;
    creator?: JiraUser | null;
    project: {
      id: string;
      key: string;
      name: string;
    };
    labels?: string[];
    components?: JiraComponent[];
    fixVersions?: JiraVersion[];
    versions?: JiraVersion[];
    created: string;
    updated: string;
    duedate?: string | null;
    resolution?: JiraResolution | null;
    resolutiondate?: string | null;
    timetracking?: {
      originalEstimate?: string;
      remainingEstimate?: string;
      timeSpent?: string;
      originalEstimateSeconds?: number;
      remainingEstimateSeconds?: number;
      timeSpentSeconds?: number;
    };
    worklog?: {
      total: number;
      worklogs: JiraWorklog[];
    };
    comment?: {
      total: number;
      comments: JiraComment[];
    };
    attachment?: JiraAttachment[];
    subtasks?: JiraIssue[];
    parent?: {
      id: string;
      key: string;
      fields: {
        summary: string;
        status: JiraStatus;
        issuetype: JiraIssueType;
      };
    };
    issuelinks?: JiraIssueLink[];
    watches?: {
      watchCount: number;
      isWatching: boolean;
    };
    votes?: {
      votes: number;
      hasVoted: boolean;
    };
    [key: string]: unknown; // For custom fields
  };
  changelog?: {
    histories: JiraChangelogEntry[];
  };
}

export interface JiraIssueLink {
  id: string;
  type: {
    id: string;
    name: string;
    inward: string;
    outward: string;
  };
  inwardIssue?: {
    id: string;
    key: string;
    fields: {
      summary: string;
      status: JiraStatus;
      issuetype: JiraIssueType;
    };
  };
  outwardIssue?: {
    id: string;
    key: string;
    fields: {
      summary: string;
      status: JiraStatus;
      issuetype: JiraIssueType;
    };
  };
}

export interface JiraIssueLinkType {
  id: string;
  name: string;
  inward: string;
  outward: string;
}

// =============================================================================
// Comment Types
// =============================================================================

export interface JiraComment {
  id: string;
  self: string;
  author?: JiraUser;
  body: ADFDocument;
  created: string;
  updated: string;
  updateAuthor?: JiraUser;
  visibility?: {
    type: 'group' | 'role';
    value: string;
  };
}

// =============================================================================
// Worklog Types
// =============================================================================

export interface JiraWorklog {
  id: string;
  self: string;
  author?: JiraUser;
  updateAuthor?: JiraUser;
  comment?: ADFDocument;
  created: string;
  updated: string;
  started: string;
  timeSpent: string;
  timeSpentSeconds: number;
  issueId?: string;
}

// =============================================================================
// Attachment Types
// =============================================================================

export interface JiraAttachment {
  id: string;
  self: string;
  filename: string;
  author?: JiraUser;
  created: string;
  size: number;
  mimeType: string;
  content: string; // URL to download
  thumbnail?: string; // URL for thumbnail
}

// =============================================================================
// Transition Types
// =============================================================================

export interface JiraTransition {
  id: string;
  name: string;
  to: JiraStatus;
  hasScreen: boolean;
  isGlobal: boolean;
  isInitial: boolean;
  isAvailable: boolean;
  isConditional: boolean;
  fields?: Record<string, {
    required: boolean;
    schema: Record<string, unknown>;
    name: string;
    key: string;
    operations: string[];
    allowedValues?: unknown[];
  }>;
}

// =============================================================================
// Board Types (Agile)
// =============================================================================

export interface JiraBoard {
  id: number;
  self: string;
  name: string;
  type: 'scrum' | 'kanban' | 'simple';
  location?: {
    projectId?: number;
    projectKey?: string;
    projectName?: string;
    displayName?: string;
    avatarURI?: string;
  };
}

// =============================================================================
// Sprint Types (Agile)
// =============================================================================

export interface JiraSprint {
  id: number;
  self: string;
  state: 'future' | 'active' | 'closed';
  name: string;
  startDate?: string;
  endDate?: string;
  completeDate?: string;
  originBoardId?: number;
  goal?: string;
}

// =============================================================================
// Epic Types (Agile)
// =============================================================================

export interface JiraEpic {
  id: number;
  key: string;
  self: string;
  name: string;
  summary: string;
  color: {
    key: string;
  };
  done: boolean;
}

// =============================================================================
// Filter Types
// =============================================================================

export interface JiraFilter {
  id: string;
  self: string;
  name: string;
  description?: string;
  owner?: JiraUser;
  jql: string;
  viewUrl: string;
  searchUrl: string;
  favourite: boolean;
  favouritedCount?: number;
  sharePermissions?: Array<{
    id: number;
    type: string;
    project?: { id: string; key: string; name: string };
    role?: { id: number; name: string };
    group?: { name: string };
  }>;
  subscriptions?: Array<{
    id: number;
    user?: JiraUser;
    group?: { name: string };
  }>;
}

// =============================================================================
// Dashboard Types
// =============================================================================

export interface JiraDashboard {
  id: string;
  self: string;
  name: string;
  description?: string;
  owner?: JiraUser;
  isFavourite: boolean;
  popularity?: number;
  rank?: number;
  view?: string;
  editPermissions?: Array<{
    type: string;
    project?: { id: string };
    role?: { id: number };
    group?: { name: string };
    user?: JiraUser;
  }>;
  sharePermissions?: Array<{
    type: string;
    project?: { id: string };
    role?: { id: number };
    group?: { name: string };
    user?: JiraUser;
  }>;
}

// =============================================================================
// Field Types
// =============================================================================

export interface JiraField {
  id: string;
  key: string;
  name: string;
  custom: boolean;
  orderable: boolean;
  navigable: boolean;
  searchable: boolean;
  clauseNames?: string[];
  schema?: {
    type: string;
    items?: string;
    system?: string;
    custom?: string;
    customId?: number;
  };
}

// =============================================================================
// Webhook Types
// =============================================================================

export interface JiraWebhook {
  id: number;
  name: string;
  url: string;
  events: string[];
  filters?: {
    issueRelatedEventsSection?: string;
  };
  excludeBody?: boolean;
  enabled: boolean;
}

// =============================================================================
// Group Types
// =============================================================================

export interface JiraGroup {
  name: string;
  groupId?: string;
  self?: string;
}

// =============================================================================
// Permission Types
// =============================================================================

export interface JiraPermission {
  id: string;
  key: string;
  name: string;
  type: string;
  description?: string;
}

// =============================================================================
// Changelog Types
// =============================================================================

export interface JiraChangelogEntry {
  id: string;
  author?: JiraUser;
  created: string;
  items: Array<{
    field: string;
    fieldtype: string;
    fieldId?: string;
    from?: string;
    fromString?: string;
    to?: string;
    toString?: string;
  }>;
}

// =============================================================================
// Search Types
// =============================================================================

export interface JiraSearchResult {
  expand?: string;
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraIssue[];
  warningMessages?: string[];
  names?: Record<string, string>;
  schema?: Record<string, { type: string; items?: string; system?: string }>;
}

// =============================================================================
// Myself Types
// =============================================================================

export interface JiraMyself extends JiraUser {
  groups?: {
    size: number;
    items: Array<{ name: string; self: string }>;
  };
  applicationRoles?: {
    size: number;
    items: Array<{ key: string; name: string }>;
  };
}
