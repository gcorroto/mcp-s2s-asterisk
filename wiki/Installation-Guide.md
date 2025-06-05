# 🛠️ Installation Guide

This guide will walk you through the process of installing and configuring Kanban MCP.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- 🐳 [Docker](https://www.docker.com/get-started) for running Planka
- 🔄 [Git](https://git-scm.com/downloads) for cloning the repository
- 🟢 [Node.js](https://nodejs.org/) (version 18 or above) and npm for development

## 📥 Installation Methods

There are two main ways to set up Kanban MCP:

1. **Node.js-based setup** (Recommended): Run Planka in Docker and the MCP server with Node.js
2. **Docker-based setup**: Run both Planka and the MCP server in Docker

### Node.js-based Setup (Recommended)

#### 1. Clone the Repository

```bash
git clone https://github.com/bradrisse/kanban-mcp.git
cd kanban-mcp
```

#### 2. Install Dependencies and Build

```bash
npm install
npm run build
```

#### 3. Start the Planka Containers

```bash
npm run up
```

#### 4. Access the Planka Kanban Board

Once the containers are running, you can access the Planka board at:

```
http://localhost:3333
```

Use the default credentials to log in:
- Email: demo@demo.demo
- Password: demo

#### 5. Configure Cursor to Use the MCP Server

In Cursor, go to `Cursor Settings` > `Features` > `MCP` and click on the `+ Add New MCP Server` button.
Fill out the form:
   - Name: Enter a nickname for the server (e.g., "Kanban MCP")
   - Type: Select "stdio" as the transport
   - Command: Enter the command to run the Node.js server:
     ```
     node /absolute/path/to/kanban-mcp/dist/index.js
     ```
   - Environment: Add the following environment variables:
     - PLANKA_BASE_URL: http://localhost:3333
     - PLANKA_AGENT_EMAIL: demo@demo.demo (or your agent email)
     - PLANKA_AGENT_PASSWORD: demo (or your agent password)

Alternatively, you can configure the MCP server for a specific project using `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "kanban": {
      "command": "node",
      "args": ["/absolute/path/to/kanban-mcp/dist/index.js"],
      "env": {
        "PLANKA_BASE_URL": "http://localhost:3333",
        "PLANKA_AGENT_EMAIL": "demo@demo.demo",
        "PLANKA_AGENT_PASSWORD": "demo"
      }
    }
  }
}
```

Replace `/absolute/path/to/kanban-mcp` with the actual absolute path to your kanban-mcp directory.

> **Important**: Cursor manages starting and stopping the MCP server for you, so you don't need to manually run the server.

### Docker-based Setup (Alternative)

If you prefer to run the MCP server in Docker, follow these steps:

#### 1. Clone the Repository

```bash
git clone https://github.com/bradrisse/kanban-mcp.git
cd kanban-mcp
```

#### 2. Build the Docker Image

```bash
npm run build-docker
```

#### 3. Start the Planka Containers

```bash
npm run up
```

#### 4. Access the Planka Kanban Board

Once the containers are running, you can access the Planka board at:

```
http://localhost:3333
```

Use the default credentials to log in:
- Email: demo@demo.demo
- Password: demo

#### 5. Configure Cursor to Use the MCP Server

In Cursor, go to `Cursor Settings` > `Features` > `MCP` and click on the `+ Add New MCP Server` button.
Fill out the form:
   - Name: Enter a nickname for the server (e.g., "Kanban MCP")
   - Type: Select "stdio" as the transport
   - Command: Enter the command to run the Docker container:
     ```
     docker run -i --rm -e PLANKA_BASE_URL=http://host.docker.internal:3333 -e PLANKA_AGENT_EMAIL=demo@demo.demo -e PLANKA_AGENT_PASSWORD=demo mcp-kanban:latest
     ```

Alternatively, you can configure the MCP server for a specific project using `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "kanban": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "PLANKA_BASE_URL=http://host.docker.internal:3333",
        "-e",
        "PLANKA_AGENT_EMAIL=demo@demo.demo",
        "-e",
        "PLANKA_AGENT_PASSWORD=demo",
        "mcp-kanban:latest"
      ]
    }
  }
}
```

### ⚠️ Important Configuration Notes

When configuring Docker:

1. 🔗 Use `host.docker.internal` instead of `localhost` to access the host from within the container
   - This is critical for Docker containers to reach services on your host machine
   - `localhost` within the container refers to the container itself, not your host machine

2. 🔑 Explicitly set environment variables with their full values in Docker args
   - Don't use variable references like `${VARIABLE}`
   - Always provide the complete values directly

3. 🔒 Ensure both email and password environment variables are correctly set
   - Authentication requires both credentials to be properly configured
   - Check for typos in both the email and password

4. 📋 Use the correct port in `PLANKA_BASE_URL` (matching your .env file)
   - Default is usually 3333, but confirm in your configuration

5. 🏷️ Use the correct image tag (typically `latest` or matching your package.json version)

## 🔍 Detailed Planka Setup

After starting the Planka Docker containers, you need to perform several additional setup steps:

### 1. Initial Login and Project Creation

1. Access the Planka web interface at http://localhost:3333
2. Log in with the admin credentials
3. Create a new project:
   - Click the "+" button
   - Enter a project name (e.g., "My Project")
   - Click "Create"

### 2. Creating the Agent User

The MCP Kanban server needs a dedicated user account to interact with Planka:

1. While logged in as admin, click on users icon in the top right
2. Click the "Add user" button
3. Fill in the agent user details:
   - Name: `Kanban Agent` (or any descriptive name)
   - Username: `kanban-agent` (or any unique username)
   - Email: `claude-kanban-mcp@cursor.com` (or your preferred agent email)
   - Password: `supersupersecre` (or a secure password)
4. Click "Add" to create the agent user
5. Make note of the agent's username, email, and password as you'll need them for MCP configuration

### 3. Adding the Agent User to Your Project

The agent user needs access to your project to manage cards and tasks:

1. Go back to your project board
2. Click on the project name in the top-left corner
3. Click on the "Managers" tab
4. Click the add user icon
5. Search for the agent user by username or email
6. Select the agent user

## 📜 Configuring Rules for LLMs

To help LLMs understand how to use the MCP Kanban server effectively, create a `.cursorrules` file in your project root by copying the rules from the provided `EXAMPLE_RULE.md` file.

## ✅ Verifying the Setup

To verify that the MCP Kanban server can connect to Planka with the agent credentials:

1. Restart MCP to apply the MCP configuration changes
2. Open a new chat with Claude in Cursor
3. Ask Claude to list the available projects using the MCP Kanban tools
4. Claude should be able to retrieve and display your project information

## ❓ Troubleshooting

If you encounter issues during installation, please refer to the [Troubleshooting](Troubleshooting) page. 