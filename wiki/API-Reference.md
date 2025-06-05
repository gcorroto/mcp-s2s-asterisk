# API Reference

This page provides detailed documentation for all the commands available in the Kanban MCP.

## Command Structure

All commands follow a standard structure:

```json
{
  "command": "command_name",
  "params": {
    // Command-specific parameters
  }
}
```

The response from the MCP server will have the following structure:

```json
{
  "success": true|false,
  "data": {
    // Response data if success is true
  },
  "error": "Error message if success is false"
}
```

## Project Commands

### List Projects

Lists all projects accessible to the agent user.

**Command:**
```json
{
  "command": "list_projects",
  "params": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "project_id",
      "name": "Project Name",
      "background": "#background_color",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    // More projects...
  ]
}
```

### Get Project

Gets detailed information about a specific project.

**Command:**
```json
{
  "command": "get_project",
  "params": {
    "projectId": "project_id"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "project_id",
    "name": "Project Name",
    "background": "#background_color",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "users": [
      {
        "id": "user_id",
        "name": "User Name",
        "username": "username",
        "email": "user@example.com"
      },
      // More users...
    ]
  }
}
```

### Create Project

Creates a new project.

**Command:**
```json
{
  "command": "create_project",
  "params": {
    "name": "New Project Name",
    "background": "#background_color" // Optional
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new_project_id",
    "name": "New Project Name",
    "background": "#background_color",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

## Board Commands

### List Boards

Lists all boards in a project.

**Command:**
```json
{
  "command": "list_boards",
  "params": {
    "projectId": "project_id"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "board_id",
      "name": "Board Name",
      "position": 1,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    // More boards...
  ]
}
```

### Get Board

Gets detailed information about a specific board.

**Command:**
```json
{
  "command": "get_board",
  "params": {
    "boardId": "board_id"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "board_id",
    "name": "Board Name",
    "position": 1,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "projectId": "project_id"
  }
}
```

### Create Board

Creates a new board in a project.

**Command:**
```json
{
  "command": "create_board",
  "params": {
    "projectId": "project_id",
    "name": "New Board Name",
    "position": 1 // Optional
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new_board_id",
    "name": "New Board Name",
    "position": 1,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "projectId": "project_id"
  }
}
```

## List Commands

### List Lists

Lists all lists in a board.

**Command:**
```json
{
  "command": "list_lists",
  "params": {
    "boardId": "board_id"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "list_id",
      "name": "List Name",
      "position": 1,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    // More lists...
  ]
}
```

### Get List

Gets detailed information about a specific list.

**Command:**
```json
{
  "command": "get_list",
  "params": {
    "listId": "list_id"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "list_id",
    "name": "List Name",
    "position": 1,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "boardId": "board_id"
  }
}
```

### Create List

Creates a new list in a board.

**Command:**
```json
{
  "command": "create_list",
  "params": {
    "boardId": "board_id",
    "name": "New List Name",
    "position": 1 // Optional
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new_list_id",
    "name": "New List Name",
    "position": 1,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "boardId": "board_id"
  }
}
```

## Card Commands

### List Cards

Lists all cards in a list.

**Command:**
```json
{
  "command": "list_cards",
  "params": {
    "listId": "list_id"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "card_id",
      "name": "Card Name",
      "description": "Card Description",
      "position": 1,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    // More cards...
  ]
}
```

### Get Card

Gets detailed information about a specific card.

**Command:**
```json
{
  "command": "get_card",
  "params": {
    "cardId": "card_id"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "card_id",
    "name": "Card Name",
    "description": "Card Description",
    "position": 1,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "listId": "list_id",
    "tasks": [
      // Tasks on this card
    ],
    "comments": [
      // Comments on this card
    ]
  }
}
```

### Create Card

Creates a new card in a list.

**Command:**
```json
{
  "command": "create_card",
  "params": {
    "listId": "list_id",
    "name": "New Card Name",
    "description": "Card Description", // Optional
    "position": 1 // Optional
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new_card_id",
    "name": "New Card Name",
    "description": "Card Description",
    "position": 1,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "listId": "list_id"
  }
}
```

### Update Card

Updates an existing card.

**Command:**
```json
{
  "command": "update_card",
  "params": {
    "cardId": "card_id",
    "name": "Updated Card Name", // Optional
    "description": "Updated Description" // Optional
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "card_id",
    "name": "Updated Card Name",
    "description": "Updated Description",
    "position": 1,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "listId": "list_id"
  }
}
```

### Move Card

Moves a card to a different list.

**Command:**
```json
{
  "command": "move_card",
  "params": {
    "cardId": "card_id",
    "listId": "target_list_id",
    "position": 1 // Optional
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "card_id",
    "name": "Card Name",
    "description": "Card Description",
    "position": 1,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "listId": "target_list_id"
  }
}
```

### Delete Card

Deletes a card.

**Command:**
```json
{
  "command": "delete_card",
  "params": {
    "cardId": "card_id"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "card_id"
  }
}
```

## Task Commands

### List Tasks

Lists all tasks in a card.

**Command:**
```json
{
  "command": "list_tasks",
  "params": {
    "cardId": "card_id"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "task_id",
      "name": "Task Name",
      "completed": false,
      "position": 1,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    // More tasks...
  ]
}
```

### Create Task

Creates a new task in a card.

**Command:**
```json
{
  "command": "create_task",
  "params": {
    "cardId": "card_id",
    "name": "New Task Name",
    "completed": false, // Optional
    "position": 1 // Optional
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new_task_id",
    "name": "New Task Name",
    "completed": false,
    "position": 1,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "cardId": "card_id"
  }
}
```

### Update Task

Updates an existing task.

**Command:**
```json
{
  "command": "update_task",
  "params": {
    "taskId": "task_id",
    "name": "Updated Task Name", // Optional
    "completed": true // Optional
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "task_id",
    "name": "Updated Task Name",
    "completed": true,
    "position": 1,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "cardId": "card_id"
  }
}
```

### Delete Task

Deletes a task.

**Command:**
```json
{
  "command": "delete_task",
  "params": {
    "taskId": "task_id"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "task_id"
  }
}
```

## Comment Commands

### List Comments

Lists all comments on a card.

**Command:**
```json
{
  "command": "list_comments",
  "params": {
    "cardId": "card_id"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "comment_id",
      "text": "Comment text",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "user": {
        "id": "user_id",
        "name": "User Name",
        "username": "username"
      }
    },
    // More comments...
  ]
}
```

### Create Comment

Creates a new comment on a card.

**Command:**
```json
{
  "command": "create_comment",
  "params": {
    "cardId": "card_id",
    "text": "New comment text"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new_comment_id",
    "text": "New comment text",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "cardId": "card_id",
    "userId": "user_id"
  }
}
```

### Delete Comment

Deletes a comment.

**Command:**
```json
{
  "command": "delete_comment",
  "params": {
    "commentId": "comment_id"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "comment_id"
  }
}
```

## Error Handling

When an error occurs, the MCP server will return a response with `success: false` and an error message:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common error messages include:

- "Invalid credentials": The agent's email or password is incorrect
- "Access denied": The agent doesn't have permission to access the requested resource
- "Resource not found": The requested project, board, list, card, task, or comment doesn't exist
- "Invalid parameters": The command parameters are missing or invalid

## Rate Limiting

The MCP server implements rate limiting to prevent abuse. If you exceed the rate limit, you'll receive an error response:

```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later."
}
```

## Pagination

For commands that return lists of items (like `list_projects`, `list_cards`, etc.), you can use pagination parameters:

```json
{
  "command": "list_cards",
  "params": {
    "listId": "list_id",
    "page": 1,
    "limit": 10
  }
}
```

The response will include pagination metadata:

```json
{
  "success": true,
  "data": [
    // Items...
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3
  }
}
```

## Filtering

Some list commands support filtering:

```json
{
  "command": "list_cards",
  "params": {
    "listId": "list_id",
    "filter": {
      "name": "Search term"
    }
  }
}
```

## Sorting

Some list commands support sorting:

```json
{
  "command": "list_cards",
  "params": {
    "listId": "list_id",
    "sort": {
      "field": "createdAt",
      "direction": "desc"
    }
  }
}
```

## Webhook Support

The MCP server can notify external services about changes to the kanban board through webhooks. To register a webhook:

```json
{
  "command": "register_webhook",
  "params": {
    "url": "https://your-webhook-url.com",
    "events": ["card.created", "card.updated", "card.moved"]
  }
}
```

Events will be sent as HTTP POST requests to the specified URL with a JSON payload containing the event details. 