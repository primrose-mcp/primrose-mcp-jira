# Jira MCP Server

[![Primrose MCP](https://img.shields.io/badge/Primrose-MCP-blue)](https://primrose.dev/mcp/jira)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server for integrating with Atlassian Jira. This server enables AI assistants to manage issues, projects, sprints, and more through Jira's REST API.

## Features

- **Issue Management** - Create, update, search, and manage issues
- **Comment Management** - Add and manage issue comments
- **Project Management** - Access and manage project settings
- **Agile/Scrum Tools** - Manage boards, sprints, and backlogs
- **User Management** - Access user information and assignments
- **Metadata Access** - Access field configurations and issue types
- **Filter Management** - Create and manage saved filters

## Quick Start

The easiest way to get started is using the [Primrose SDK](https://github.com/primrose-ai/primrose-mcp):

```bash
npm install primrose-mcp
```

```typescript
import { PrimroseClient } from 'primrose-mcp';

const client = new PrimroseClient({
  service: 'jira',
  headers: {
    'X-Jira-Domain': 'mycompany',
    'X-Jira-Email': 'your-email@company.com',
    'X-Jira-API-Token': 'your-api-token'
  }
});
```

## Manual Installation

```bash
# Clone and install
git clone https://github.com/primrose-ai/primrose-mcp-jira.git
cd primrose-mcp-jira
npm install

# Build
npm run build

# Run locally
npm run dev
```

## Configuration

### Required Headers (Basic Auth)

| Header | Description |
|--------|-------------|
| `X-Jira-Domain` | Jira Cloud domain (e.g., "mycompany" for mycompany.atlassian.net) |
| `X-Jira-Email` | User email for Basic Auth |
| `X-Jira-API-Token` | API token for Basic Auth |

### Optional Headers

| Header | Description |
|--------|-------------|
| `X-Jira-Access-Token` | OAuth 2.0 access token (alternative to Basic Auth) |

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CHARACTER_LIMIT` | 50000 | Maximum response character limit |
| `DEFAULT_PAGE_SIZE` | 20 | Default pagination size |
| `MAX_PAGE_SIZE` | 100 | Maximum pagination size |

## Available Tools

### Issue Tools
- Create issues
- Update issues
- Search with JQL
- Get issue details
- Transition issues
- Delete issues
- Assign issues
- Link issues

### Comment Tools
- Add comments
- Edit comments
- Delete comments
- List comments

### Project Tools
- List projects
- Get project details
- Access project components
- Manage project versions

### Agile Tools
- List boards
- Get board details
- Manage sprints
- Access backlogs
- Move issues between sprints

### User Tools
- Search users
- Get user details
- Find assignable users

### Metadata Tools
- List issue types
- Get field configurations
- Access priorities
- List statuses

### Filter Tools
- Create filters
- Update filters
- Search with filters
- Manage filter permissions

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Run type checking
npm run typecheck
```

## Related Resources

- [Primrose SDK Documentation](https://primrose.dev/docs)
- [Jira REST API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)
- [Atlassian Developer Portal](https://developer.atlassian.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## License

MIT
