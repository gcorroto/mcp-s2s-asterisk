# 👨‍💻 Developer Guide

This guide is intended for developers who want to contribute to or modify the Kanban MCP project.

## 🏗️ Project Architecture

The Kanban MCP project consists of several key components:

1. **🖥️ MCP Server**: A Node.js server that implements the MCP protocol and communicates with Planka
2. **🔌 Planka API Client**: A TypeScript client for interacting with the Planka API
3. **📡 MCP Protocol Implementation**: Handlers for MCP requests and responses
4. **🐳 Docker Configuration**: For containerizing the application

### 📁 Directory Structure

```
kanban-mcp/
├── src/                    # Source code
│   ├── index.ts            # Entry point
│   ├── mcp/                # MCP protocol implementation
│   │   ├── handlers/       # Command handlers
│   │   ├── types.ts        # Type definitions
│   │   └── utils.ts        # Utility functions
│   ├── planka/             # Planka API client
│   │   ├── client.ts       # API client implementation
│   │   ├── types.ts        # Type definitions
│   │   └── utils.ts        # Utility functions
│   └── utils/              # General utilities
├── docker/                 # Docker configuration
├── .env                    # Environment variables
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## 🚀 Development Setup

### 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose
- Git

### 🛠️ Setting Up the Development Environment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/bradrisse/kanban-mcp.git
   cd kanban-mcp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Copy the `.env.example` file to `.env` and modify as needed:
   ```bash
   cp .env.example .env
   ```

4. **Start Planka in development mode**:
   ```bash
   npm run up
   ```

5. **Run the MCP server in development mode**:
   ```bash
   npm run dev
   ```

### 🔄 Development Workflow

1. **Make changes to the code**
2. **Test your changes**:
   - Run unit tests: `npm test`
   - Test with Cursor: Configure Cursor to use your local development server
3. **Build the project**:
   ```bash
   npm run build
   ```
4. **Build the Docker image**:
   ```bash
   npm run build-docker
   ```

5. **Quality Control**:
   ```bash
   pnpm qc
   ```
   This runs linting and type checking to ensure code quality.

## ✨ Adding New Features

### 🆕 Adding a New Command

To add a new command to the MCP server:

1. **Define the command type**:
   Add the command to the `CommandType` enum in `src/mcp/types.ts`:
   ```typescript
   export enum CommandType {
     // ... existing commands
     NEW_COMMAND = 'new_command',
   }
   ```

2. **Create a handler for the command**:
   Create a new file in `src/mcp/handlers/` for your command:
   ```typescript
   // src/mcp/handlers/newCommand.ts
   import { HandlerFunction } from '../types';
   import { PlankaClient } from '../../planka/client';
   
   export const newCommandHandler: HandlerFunction = async (
     params: any,
     plankaClient: PlankaClient
   ) => {
     try {
       // Implement your command logic here
       const result = await plankaClient.someMethod(params);
       return {
         success: true,
         data: result,
       };
     } catch (error) {
       return {
         success: false,
         error: error.message,
       };
     }
   };
   ```

3. **Register the handler**:
   Add your handler to the handlers map in `src/mcp/handlers/index.ts`:
   ```typescript
   import { newCommandHandler } from './newCommand';
   
   export const handlers: Record<CommandType, HandlerFunction> = {
     // ... existing handlers
     [CommandType.NEW_COMMAND]: newCommandHandler,
   };
   ```

4. **Add Planka API client method** (if needed):
   If your command requires a new API call to Planka, add it to the `PlankaClient` class in `src/planka/client.ts`:
   ```typescript
   // src/planka/client.ts
   export class PlankaClient {
     // ... existing methods
     
     async someMethod(params: any): Promise<any> {
       const response = await this.api.post('/some/endpoint', params);
       return response.data;
     }
   }
   ```

5. **Update documentation**:
   Update the README and wiki documentation to reflect the new command.

### ⏱️ Implementing Time Tracking Features

To extend the MCP server with time tracking capabilities:

1. **Add stopwatch types** to `src/planka/types.ts`:
   ```typescript
   export interface Stopwatch {
     id: string;
     cardId: string;
     isRunning: boolean;
     startedAt: string | null;
     totalElapsedTime: number; // in seconds
   }
   ```

2. **Implement API client methods** in `src/planka/client.ts`:
   ```typescript
   // Start/resume a stopwatch
   async startStopwatch(cardId: string): Promise<Stopwatch> {
     const response = await this.api.post(`/api/cards/${cardId}/stopwatch/start`);
     return response.data;
   }
   
   // Stop a running stopwatch
   async stopStopwatch(cardId: string): Promise<Stopwatch> {
     const response = await this.api.post(`/api/cards/${cardId}/stopwatch/stop`);
     return response.data;
   }
   
   // Get current stopwatch status
   async getStopwatch(cardId: string): Promise<Stopwatch> {
     const response = await this.api.get(`/api/cards/${cardId}/stopwatch`);
     return response.data;
   }
   
   // Reset stopwatch data
   async resetStopwatch(cardId: string): Promise<Stopwatch> {
     const response = await this.api.post(`/api/cards/${cardId}/stopwatch/reset`);
     return response.data;
   }
   ```

3. **Create handler files** in `src/mcp/handlers/`:
   ```typescript
   // src/mcp/handlers/startStopwatch.ts
   import { HandlerFunction } from '../types';
   import { PlankaClient } from '../../planka/client';
   
   export const startStopwatchHandler: HandlerFunction = async (
     params: { id: string },
     plankaClient: PlankaClient
   ) => {
     try {
       const result = await plankaClient.startStopwatch(params.id);
       return {
         success: true,
         data: result,
       };
     } catch (error) {
       return {
         success: false,
         error: error.message,
       };
     }
   };
   ```

4. **Register new command handlers** in `src/mcp/handlers/index.ts`:
   ```typescript
   import { startStopwatchHandler } from './startStopwatch';
   import { stopStopwatchHandler } from './stopStopwatch';
   import { getStopwatchHandler } from './getStopwatch';
   import { resetStopwatchHandler } from './resetStopwatch';
   
   export const handlers: Record<CommandType, HandlerFunction> = {
     // ... existing handlers
     [CommandType.START_STOPWATCH]: startStopwatchHandler,
     [CommandType.STOP_STOPWATCH]: stopStopwatchHandler,
     [CommandType.GET_STOPWATCH]: getStopwatchHandler,
     [CommandType.RESET_STOPWATCH]: resetStopwatchHandler,
   };
   ```

### 🔄 Implementing Card Duplication

To implement card duplication functionality:

1. **Add the client method** to `src/planka/client.ts`:
   ```typescript
   async duplicateCard(cardId: string, listId?: string, position?: number): Promise<Card> {
     const params: any = {};
     if (listId) params.listId = listId;
     if (position !== undefined) params.position = position;
     
     const response = await this.api.post(`/api/cards/${cardId}/duplicate`, params);
     return response.data;
   }
   ```

2. **Create the handler** in `src/mcp/handlers/duplicateCard.ts`:
   ```typescript
   import { HandlerFunction } from '../types';
   import { PlankaClient } from '../../planka/client';
   
   export const duplicateCardHandler: HandlerFunction = async (
     params: { id: string; listId?: string; position?: number },
     plankaClient: PlankaClient
   ) => {
     try {
       const result = await plankaClient.duplicateCard(
         params.id,
         params.listId,
         params.position
       );
       return {
         success: true,
         data: result,
       };
     } catch (error) {
       return {
         success: false,
         error: error.message,
       };
     }
   };
   ```

3. **Register the handler** in `src/mcp/handlers/index.ts`:
   ```typescript
   import { duplicateCardHandler } from './duplicateCard';
   
   export const handlers: Record<CommandType, HandlerFunction> = {
     // ... existing handlers
     [CommandType.DUPLICATE_CARD]: duplicateCardHandler,
   };
   ```

### 🔌 Extending the Planka API Client

If you need to add support for new Planka API endpoints:

1. **Add type definitions** (if needed):
   Add any new types to `src/planka/types.ts`.

2. **Add the API method** to the `PlankaClient` class in `src/planka/client.ts`:
   ```typescript
   async newApiMethod(params: NewParamsType): Promise<ResultType> {
     const response = await this.api.post('/api/endpoint', params);
     return response.data;
   }
   ```

## 🧪 Testing

### 🔬 Unit Tests

The project uses Jest for unit testing:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### 🔄 Integration Tests

To test the integration with Planka:

1. Ensure Planka is running: `npm run up`
2. Run the integration tests: `npm run test:integration`

### 🤖 Testing with Cursor

To test your changes with Cursor:

1. Build the Docker image: `npm run build-docker`
2. Configure Cursor to use your local Docker image
3. Test the functionality in Cursor with Claude

## 🐛 Debugging

### 🔍 Debugging the MCP Server

You can enable debug logging by setting the `DEBUG` environment variable:

```bash
DEBUG=kanban-mcp:* npm run dev
```

### 🔧 Debugging Docker Issues

To debug issues with the Docker container:

```bash
# Build with debug output
npm run build-docker -- --progress=plain

# Run the container with interactive shell
docker run -it --rm mcp-kanban:latest /bin/sh

# View container logs
docker logs $(docker ps -a | grep mcp-kanban | awk '{print $1}')
```

## 🤝 Contributing Guidelines

### 📝 Code Style

The project uses ESLint and Prettier for code formatting:

```bash
# Check code style
npm run lint

# Fix code style issues
npm run lint:fix
```

### 📤 Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m "Add your feature"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a pull request to the main repository

### 📋 Best Practices

1. **Add JSDoc comments** to all public functions in non-test TypeScript files:
   ```typescript
   /**
    * Creates a new card in the specified list
    * @param listId - The ID of the list to add the card to
    * @param name - The name of the card
    * @param description - Optional description for the card
    * @returns The created card object
    */
   async createCard(listId: string, name: string, description?: string): Promise<Card> {
     // ...
   }
   ```

2. **Write comprehensive tests** for new functionality
3. **Follow separation of concerns**:
   - Keep MCP handlers focused on parameter validation and response formatting
   - Place business logic in the Planka client
   - Use utility functions for common operations
4. **Maintain backward compatibility** when possible
5. **Document new features** in the wiki

## Building and Deployment

### Building for Production

```