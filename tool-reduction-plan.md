# MCP Kanban Tool Reduction Plan

## Current Problem
- Cursor has a 40-tool limit
- The current implementation has 40+ separate Kanban tools
- Need to consolidate while retaining all capabilities

## Consolidation Strategy

Based on analysis of `index.ts`, we can consolidate all Kanban functionality into 8 tools:

### 1. `mcp_kanban_project_board_manager`
Consolidates 7 tools: `get_projects`, `get_project`, `get_boards`, `create_board`, `get_board`, `update_board`, `delete_board`

```typescript
{
  action: z.enum([
    "get_projects", "get_project", "get_boards", "create_board", 
    "get_board", "update_board", "delete_board"
  ]),
  id: z.string().optional(),
  projectId: z.string().optional(),
  name: z.string().optional(),
  position: z.number().optional(),
  type: z.string().optional(),
  page: z.number().optional(),
  perPage: z.number().optional()
}
```

### 2. `mcp_kanban_list_manager`
Consolidates 5 tools: `get_lists`, `create_list`, `update_list`, `delete_list`, `get_list`

```typescript
{
  action: z.enum(["get_all", "create", "update", "delete", "get_one"]),
  id: z.string().optional(),
  boardId: z.string().optional(),
  name: z.string().optional(),
  position: z.number().optional()
}
```

### 3. `mcp_kanban_card_manager`
Consolidates 7 tools: `get_cards`, `create_card`, `get_card`, `update_card`, `move_card`, `duplicate_card`, `delete_card`

```typescript
{
  action: z.enum(["get_all", "create", "get_one", "update", "move", "duplicate", "delete"]),
  id: z.string().optional(),
  listId: z.string().optional(),
  boardId: z.string().optional(),
  projectId: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  position: z.number().optional(),
  dueDate: z.string().optional(),
  isCompleted: z.boolean().optional()
}
```

### 4. `mcp_kanban_stopwatch`
Consolidates 4 tools: `start_card_stopwatch`, `stop_card_stopwatch`, `get_card_stopwatch`, `reset_card_stopwatch`

```typescript
{
  action: z.enum(["start", "stop", "get", "reset"]),
  id: z.string()
}
```

### 5. `mcp_kanban_label_manager`
Consolidates 6 tools: `get_labels`, `create_label`, `update_label`, `delete_label`, `add_label_to_card`, `remove_label_from_card`

```typescript
{
  action: z.enum(["get_all", "create", "update", "delete", "add_to_card", "remove_from_card"]),
  id: z.string().optional(),
  boardId: z.string().optional(),
  cardId: z.string().optional(),
  labelId: z.string().optional(),
  name: z.string().optional(),
  color: z.enum(VALID_LABEL_COLORS).optional(),
  position: z.number().optional()
}
```

### 6. `mcp_kanban_task_manager`
Consolidates 6 tools: `get_tasks`, `create_task`, `batch_create_tasks`, `get_task`, `update_task`, `delete_task` plus a new action for completing tasks

```typescript
{
  action: z.enum(["get_all", "create", "batch_create", "get_one", "update", "delete", "complete_task"]),
  id: z.string().optional(),
  cardId: z.string().optional(),
  name: z.string().optional(),
  isCompleted: z.boolean().optional(),
  position: z.number().optional(),
  tasks: z.array(
    z.object({
      cardId: z.string(),
      name: z.string(),
      position: z.number().optional()
    })
  ).optional()
}
```

### 7. `mcp_kanban_comment_manager`
Consolidates 5 tools: `get_comments`, `create_comment`, `get_comment`, `update_comment`, `delete_comment`

```typescript
{
  action: z.enum(["get_all", "create", "get_one", "update", "delete"]),
  id: z.string().optional(),
  cardId: z.string().optional(),
  text: z.string().optional()
}
```

### 8. `mcp_kanban_membership_manager`
Consolidates 5 tools: `get_board_memberships`, `create_board_membership`, `get_board_membership`, `update_board_membership`, `delete_board_membership`

```typescript
{
  action: z.enum(["get_all", "create", "get_one", "update", "delete"]),
  id: z.string().optional(),
  boardId: z.string().optional(),
  userId: z.string().optional(),
  role: z.enum(["editor", "viewer"]).optional(),
  canComment: z.boolean().optional()
}
```

## Implementation Example

Here's an example implementation for the `mcp_kanban_card_manager`:

```typescript
server.tool(
  "mcp_kanban_card_manager",
  "Manage kanban cards with various operations",
  {
    action: z.enum(["get_all", "create", "get_one", "update", "move", "duplicate", "delete"]),
    id: z.string().optional(),
    listId: z.string().optional(),
    boardId: z.string().optional(),
    projectId: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    position: z.number().optional(),
    dueDate: z.string().optional(),
    isCompleted: z.boolean().optional()
  },
  async (args) => {
    let result;
    
    switch (args.action) {
      case "get_all":
        if (!args.listId) throw new Error("listId is required for get_all action");
        result = await cards.getCards(args.listId);
        break;
        
      case "create":
        if (!args.listId || !args.name) throw new Error("listId and name are required for create action");
        result = await cards.createCard({
          listId: args.listId,
          name: args.name,
          description: args.description || "",
          position: args.position || 0
        });
        break;
        
      case "get_one":
        if (!args.id) throw new Error("id is required for get_one action");
        result = await cards.getCard(args.id);
        break;
        
      case "update":
        if (!args.id) throw new Error("id is required for update action");
        const updateOptions = {
          name: args.name,
          description: args.description,
          position: args.position,
          dueDate: args.dueDate,
          isCompleted: args.isCompleted
        };
        // Filter out undefined values
        Object.keys(updateOptions).forEach(key => 
          updateOptions[key] === undefined && delete updateOptions[key]
        );
        result = await cards.updateCard(args.id, updateOptions);
        break;
        
      case "move":
        if (!args.id || !args.listId || args.position === undefined) 
          throw new Error("id, listId, and position are required for move action");
        result = await cards.moveCard(
          args.id,
          args.listId,
          args.position,
          args.boardId,
          args.projectId
        );
        break;
        
      case "duplicate":
        if (!args.id || args.position === undefined)
          throw new Error("id and position are required for duplicate action");
        result = await cards.duplicateCard(args.id, args.position);
        break;
        
      case "delete":
        if (!args.id) throw new Error("id is required for delete action");
        result = await cards.deleteCard(args.id);
        break;
        
      default:
        throw new Error(`Unknown action: ${args.action}`);
    }
    
    return {
      content: [{ type: "text", text: JSON.stringify(result) }]
    };
  }
);
```

And here's an example implementation for the task manager with the new complete_task action:

```typescript
server.tool(
  "mcp_kanban_task_manager",
  "Manage kanban tasks with various operations",
  {
    action: z.enum(["get_all", "create", "batch_create", "get_one", "update", "delete", "complete_task"]),
    id: z.string().optional(),
    cardId: z.string().optional(),
    name: z.string().optional(),
    isCompleted: z.boolean().optional(),
    position: z.number().optional(),
    tasks: z.array(
      z.object({
        cardId: z.string(),
        name: z.string(),
        position: z.number().optional()
      })
    ).optional()
  },
  async (args) => {
    let result;
    
    switch (args.action) {
      case "get_all":
        if (!args.cardId) throw new Error("cardId is required for get_all action");
        result = await tasks.getTasks(args.cardId);
        break;
        
      case "create":
        if (!args.cardId || !args.name) throw new Error("cardId and name are required for create action");
        result = await tasks.createTask({
          cardId: args.cardId,
          name: args.name,
          position: args.position
        });
        break;
        
      case "batch_create":
        if (!args.tasks || !args.tasks.length) throw new Error("tasks array is required for batch_create action");
        result = await tasks.batchCreateTasks({ tasks: args.tasks });
        break;
        
      case "get_one":
        if (!args.id) throw new Error("id is required for get_one action");
        result = await tasks.getTask(args.id);
        break;
        
      case "update":
        if (!args.id) throw new Error("id is required for update action");
        const updateOptions = {
          name: args.name,
          isCompleted: args.isCompleted,
          position: args.position
        };
        // Filter out undefined values
        Object.keys(updateOptions).forEach(key => 
          updateOptions[key] === undefined && delete updateOptions[key]
        );
        result = await tasks.updateTask(args.id, updateOptions);
        break;
        
      case "complete_task":
        if (!args.id) throw new Error("id is required for complete_task action");
        // Specialized action just for completing a task
        result = await tasks.updateTask(args.id, { isCompleted: true });
        break;
        
      case "delete":
        if (!args.id) throw new Error("id is required for delete action");
        result = await tasks.deleteTask(args.id);
        break;
        
      default:
        throw new Error(`Unknown action: ${args.action}`);
    }
    
    return {
      content: [{ type: "text", text: JSON.stringify(result) }]
    };
  }
);
```

## Summary of Reduction

| Category | Original Count | Consolidated Count |
|----------|----------------|-------------------|
| Project & Board Management | 7 | 1 |
| List Management | 5 | 1 |
| Card Management | 7 | 1 |
| Card Stopwatch | 4 | 1 |
| Label Management | 6 | 1 |
| Task Management | 6 | 1 |
| Comment Management | 5 | 1 |
| Membership Management | 5 | 1 |
| **TOTAL** | **45** | **8** |

This consolidation reduces the tool count from 45 to 8, well under the 40-tool limit, while maintaining all the original capabilities through the use of action parameters.

## Implementation Steps

1. Create the 8 new consolidated tools with action parameters
2. Implement the switch-case logic for each tool to route to appropriate functionality
3. Add validation for required parameters based on the action
4. Update documentation for API users to reflect the new structure
5. Consider adding backward compatibility wrappers if needed 