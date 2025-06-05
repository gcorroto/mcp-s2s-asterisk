# LLM Guide: Kanban Development with Consolidated Tools

This guide provides instructions for LLMs on effectively using consolidated Kanban tools when assisting with development tasks.

## 1. User-First Approach

- **Prioritize user requests over Kanban operations**
- Only use Kanban tools when explicitly requested or after completing primary task
- Signal transitions clearly: "Now that we've addressed your question, I'll update the Kanban board..."

## 2. Board Analysis & Navigation

### 2.1 Board Structure Assessment
```
mcp_kanban_project_board_manager({ action: "get_projects" })
mcp_kanban_project_board_manager({ action: "get_boards", projectId: "proj_id" })
mcp_kanban_list_manager({ action: "get_all", boardId: "board_id" })
```

### 2.2 Card Inventory
```
mcp_kanban_card_manager({ action: "get_all", listId: "list_id" })
mcp_kanban_label_manager({ action: "get_all", boardId: "board_id" })
```

## 3. Workflow Management

### 3.1 Card Selection
```
// Move card to "In Progress" list
mcp_kanban_card_manager({ 
  action: "move", 
  id: "card_id", 
  listId: "in_progress_list_id", 
  position: 0 
})

// Add starting comment
mcp_kanban_comment_manager({
  action: "create",
  cardId: "card_id",
  text: "▶️ Starting work on this card."
})

// Start timer
mcp_kanban_stopwatch({ action: "start", id: "card_id" })
```

### 3.2 Task Implementation
```
// Get tasks
mcp_kanban_task_manager({ action: "get_all", cardId: "card_id" })

// Complete task
mcp_kanban_task_manager({ action: "complete_task", id: "task_id" })

// Add new task
mcp_kanban_task_manager({
  action: "create",
  cardId: "card_id",
  name: "New task description"
})
```

### 3.3 Dynamic Task Management
```
// Add label to card
mcp_kanban_label_manager({
  action: "add_to_card",
  cardId: "card_id",
  labelId: "blocked_label_id"
})
```

## 4. Card Lifecycle Management

### 4.1 Moving Cards Through Workflow
```
// Move to "Testing" list
mcp_kanban_card_manager({
  action: "move",
  id: "card_id",
  listId: "testing_list_id",
  position: 0
})

// Stop timer
mcp_kanban_stopwatch({ action: "stop", id: "card_id" })

// Add implementation summary
mcp_kanban_comment_manager({
  action: "create",
  cardId: "card_id",
  text: "🔍 Ready for review\n\nSummary of changes:\n- [changes]"
})
```

### 4.2 Handling Feedback
```
// Get comments
mcp_kanban_comment_manager({ action: "get_all", cardId: "card_id" })

// Move back to "In Progress" if needed
mcp_kanban_card_manager({
  action: "move",
  id: "card_id",
  listId: "in_progress_list_id",
  position: 0
})
```

## 5. Communication Standards

### 5.1 Label Management
```
// Create new label
mcp_kanban_label_manager({
  action: "create",
  boardId: "board_id",
  name: "Bug",
  color: "berry-red"
})
```

### 5.2 Comment Templates

1. **Starting Work**:
   ```
   ▶️ Starting work on this card.
   Initial assessment: [brief analysis]
   Planned approach: [implementation plan]
   ```

2. **Task Completion**:
   ```
   ✅ Completed task: [task name]
   Implementation details: [what was done]
   ```

3. **Implementation Summary**:
   ```
   🔍 Ready for review
   
   Summary of changes:
   - [major change 1]
   - [major change 2]
   
   Testing considerations:
   - [area to test 1]
   ```

## 6. Progress Tracking

```
// Get stopwatch status
mcp_kanban_stopwatch({ action: "get", id: "card_id" })

// Get board summary
mcp_kanban_project_board_manager({
  action: "get_board_summary",
  boardId: "board_id",
  includeTaskDetails: true,
  includeComments: true
})
```

## 7. Workflow Checklist

1. **Initial Analysis**
   - [ ] Retrieve board structure
   - [ ] Identify priority cards

2. **Card Selection**
   - [ ] Move card to "In Progress"
   - [ ] Start stopwatch
   - [ ] Add starting comment

3. **Task Implementation**
   - [ ] Complete tasks sequentially
   - [ ] Document progress

4. **Completion**
   - [ ] Move card to "Testing"
   - [ ] Stop stopwatch
   - [ ] Add implementation summary

5. **Feedback Handling**
   - [ ] Process feedback
   - [ ] Create tasks for changes
   - [ ] Update status 