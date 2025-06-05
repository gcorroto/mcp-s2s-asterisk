# 📝 Usage Guide

This guide explains how to use the Kanban MCP tools with Claude in Cursor to manage your Planka kanban board.

## 🛠️ Available Commands

The Kanban MCP provides several commands that Claude can use to interact with your Planka board:

### 📂 Project Management

- **List Projects**: View all available projects
- **Get Project**: Get details about a specific project
- **Create Project**: Create a new project

### 📊 Board Management

- **List Boards**: View all boards in a project
- **Get Board**: Get details about a specific board
- **Create Board**: Create a new board in a project
- **Get Board Summary**: Get a summary of a board's content

### 📋 List Management

- **List Lists**: View all lists in a board
- **Get List**: Get details about a specific list
- **Create List**: Create a new list in a board
- **Update List**: Update a list's name or position

### 🗂️ Card Management

- **List Cards**: View all cards in a list
- **Get Card**: Get details about a specific card
- **Create Card**: Create a new card in a list
- **Update Card**: Update an existing card
- **Move Card**: Move a card to a different list
- **Delete Card**: Delete a card
- **Duplicate Card**: Create a copy of an existing card
- **Get Card Details**: Get detailed information about a card

### ⏱️ Time Tracking

- **Start Stopwatch**: Begin tracking time for a card
- **Stop Stopwatch**: Stop tracking time for a card
- **Get Stopwatch**: Get the current stopwatch status for a card
- **Reset Stopwatch**: Reset the time tracking for a card

### ✅ Task Management

- **List Tasks**: View all tasks in a card
- **Create Task**: Create a new task in a card
- **Create Multiple Tasks**: Add multiple tasks to a card at once
- **Update Task**: Update an existing task
- **Delete Task**: Delete a task
- **Complete Task**: Mark a task as complete

### 💬 Comment Management

- **List Comments**: View all comments on a card
- **Create Comment**: Add a new comment to a card
- **Update Comment**: Edit an existing comment
- **Delete Comment**: Delete a comment

### 🏷️ Label Management

- **List Labels**: View all labels in a board
- **Create Label**: Create a new label
- **Update Label**: Update a label
- **Delete Label**: Delete a label
- **Add Label to Card**: Apply a label to a card
- **Remove Label from Card**: Remove a label from a card

## 🤔 Using Kanban MCP with Claude

Once you've set up Kanban MCP (see the [Installation Guide](Installation-Guide)), you can use it with Claude in Cursor. Here's how to use the various commands:

### 🔄 Basic Workflow

1. **Start a conversation with Claude** in Cursor
2. **Ask Claude to perform kanban-related tasks** using natural language
3. Claude will use the appropriate Kanban MCP commands to fulfill your request

### 💡 Example Interactions

Here are some examples of how to interact with Claude to manage your kanban board:

#### Viewing Projects and Boards

```
You: Show me all my projects
Claude: [Lists all available projects]

You: What boards do I have in the "Development" project?
Claude: [Lists all boards in the Development project]

You: Show me the cards in the "To Do" list on the "Sprint 1" board
Claude: [Lists all cards in the To Do list]

You: Give me a summary of my "Sprint 1" board
Claude: [Provides a summary of lists and cards on the board]
```

#### Creating and Managing Cards

```
You: Create a new card titled "Implement login feature" in the "To Do" list
Claude: [Creates the card and confirms]

You: Add a description to the "Implement login feature" card: "Create a secure login system with email verification"
Claude: [Updates the card with the description]

You: Move the "Implement login feature" card to the "In Progress" list
Claude: [Moves the card and confirms]

You: Duplicate the "User registration" card to the "To Do" list
Claude: [Creates a copy of the card and confirms]
```

#### Working with Tasks

```
You: Add tasks to the "Implement login feature" card:
1. Create login form
2. Implement authentication logic
3. Add email verification
Claude: [Creates the tasks and confirms]

You: Mark the "Create login form" task as complete
Claude: [Updates the task status and confirms]
```

#### Time Tracking

```
You: Start tracking time for the "Implement login feature" card
Claude: [Starts the stopwatch and confirms]

You: How long have I been working on the "Implement login feature" card?
Claude: [Checks the stopwatch and reports the time]

You: Stop the timer for the "Implement login feature" card
Claude: [Stops the stopwatch and confirms]
```

#### Adding Comments

```
You: Add a comment to the "Implement login feature" card: "Let's use JWT for authentication"
Claude: [Adds the comment and confirms]

You: Show me all comments on the "Implement login feature" card
Claude: [Lists all comments]
```

#### Working with Labels

```
You: Create a "High Priority" label with red color for the "Sprint 1" board
Claude: [Creates the label and confirms]

You: Add the "High Priority" label to the "Implement login feature" card
Claude: [Adds the label to the card and confirms]
```

### 💯 Tips for Effective Use

1. **Be specific with your requests**:
   - Include the project, board, and list names when referring to cards
   - Use the exact names of cards, lists, and boards

2. **Use natural language**:
   - You don't need to use specific command syntax
   - Claude will interpret your intent and use the appropriate MCP commands

3. **Chain related actions**:
   - You can ask Claude to perform multiple related actions in a single request
   - Example: "Create a new card called 'Fix bugs' in the 'To Do' list and add three tasks: fix login bug, fix navigation bug, and fix form validation bug"

4. **Track your time**:
   - Use the time tracking features to monitor how long you spend on tasks
   - Ask Claude to start/stop timers as you work on different cards

5. **Ask for help**:
   - If you're unsure about what commands are available, ask Claude for help
   - Example: "What kanban commands can you use?" or "How do I create a new card?"

## 🚀 Advanced Usage

### 📆 Using Kanban MCP for Project Management

The Kanban MCP tools can be integrated into your development workflow:

1. **Sprint Planning**:
   - Create a new board for each sprint
   - Set up lists for "To Do", "In Progress", "Review", and "Done"
   - Create cards for all planned tasks with detailed descriptions
   - Use time tracking to estimate and monitor task duration

2. **Daily Stand-ups**:
   - Ask Claude to show you all cards in the "In Progress" list
   - Move cards between lists as work progresses
   - Add comments to cards to document progress or blockers
   - Check time spent on tasks to identify bottlenecks

3. **Code Reviews**:
   - Create a dedicated list for "Ready for Review"
   - Move cards there when code is ready to be reviewed
   - Add comments with review feedback
   - Use labels to categorize review status (approved, changes requested, etc.)

4. **Retrospectives**:
   - Review completed cards in the "Done" list
   - Analyze how long cards spent in each list
   - Use time tracking data to identify areas for improvement
   - Create new cards for action items from the retrospective

### 💻 Integrating with Development Tasks

Claude can help you manage your development tasks using the Kanban MCP:

1. **Task Breakdown**:
   - Ask Claude to help break down a complex feature into smaller tasks
   - Create cards for each task with appropriate descriptions
   - Use the "Create Multiple Tasks" feature to quickly add task lists

2. **Progress Tracking**:
   - Ask Claude to summarize the current state of your board
   - Get insights into what's completed and what's still pending
   - Use time tracking to monitor how long tasks are taking

3. **Documentation**:
   - Use card descriptions and comments to document implementation details
   - Ask Claude to summarize this documentation when needed
   - Duplicate cards with documentation to create templates for similar tasks

### ⏱️ Time Management Features

Kanban MCP includes powerful time tracking capabilities:

1. **Card Stopwatches**:
   - Start a stopwatch when you begin working on a card
   - Pause the stopwatch when you take breaks or switch tasks
   - Track total time spent on individual cards
   - Reset stopwatches at the beginning of new work sessions

2. **Time Analysis**:
   - Compare estimated vs. actual time spent
   - Identify which tasks are taking longer than expected
   - Use time data to improve future estimates
   - Track productivity over time

3. **Example Workflows**:
   ```
   You: Start timer for "Implement user authentication"
   Claude: [Starts stopwatch]
   
   ... work on the task ...
   
   You: Pause timer for "Implement user authentication"
   Claude: [Stops stopwatch and shows elapsed time]
   
   You: How much time have I spent on "Implement user authentication"?
   Claude: [Shows total tracked time]
   ```

## ⚠️ Troubleshooting

If you encounter issues while using the Kanban MCP with Claude:

1. **Check the connection**:
   - Ensure the MCP server is running
   - Verify that Claude can connect to the MCP server

2. **Verify permissions**:
   - Make sure the agent user has access to the projects you're trying to manage

3. **Be specific**:
   - If Claude is having trouble understanding your request, try being more specific
   - Include full names and IDs when referring to projects, boards, lists, or cards

For more detailed troubleshooting, see the [Troubleshooting](Troubleshooting) page. 