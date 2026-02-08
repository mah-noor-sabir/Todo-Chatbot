"""
Taskify Bot - AI Agent for Natural Language Todo Management

This module implements the AI agent that processes natural language
requests and manages todo tasks through function calling.
"""

import asyncio
import json
from typing import Dict, Any, List, Optional
from enum import Enum

from openai import AsyncOpenAI
from pydantic import BaseModel, Field

from src.core.config import settings


class Priority(str(Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class TaskStatus(str(Enum):
    ALL = "all"
    COMPLETED = "completed"
    INCOMPLETE = "incomplete"


class AddTaskRequest(BaseModel):
    title: str = Field(..., description="Task title (required, non-empty)")
    description: Optional[str] = Field(None, description="Optional task description with additional details")


class ListTasksRequest(BaseModel):
    status: Optional[TaskStatus] = Field(None, description="Filter tasks by completion status")


class CompleteTaskRequest(BaseModel):
    task_id: int = Field(..., description="ID of the task to mark as completed")


class DeleteTaskRequest(BaseModel):
    task_id: int = Field(..., description="ID of the task to delete")


class UpdateTaskRequest(BaseModel):
    task_id: int = Field(..., description="ID of the task to update")
    title: Optional[str] = Field(None, description="New task title (optional, at least one of title or description required)")
    description: Optional[str] = Field(None, description="New task description (optional, at least one of title or description required)")


class DeleteTasksBulkRequest(BaseModel):
    status: Optional[TaskStatus] = Field(None, description="Filter tasks by completion status for bulk deletion")


class TaskifyBot:
    """
    AI Agent for processing natural language todo management requests.
    """
    
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.OPENROUTER_API_KEY,
            base_url=settings.OPENROUTER_BASE_URL
        )
        self.model = settings.OPENROUTER_MODEL
        
        # Define the tools available to the agent
        self.tools = [
            {
                "type": "function",
                "function": {
                    "name": "add_task",
                    "description": "Create a new todo task for the user",
                    "parameters": AddTaskRequest.model_json_schema()
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_tasks",
                    "description": "Retrieve user's tasks, optionally filtered by completion status",
                    "parameters": ListTasksRequest.model_json_schema()
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "complete_task",
                    "description": "Mark a task as completed",
                    "parameters": CompleteTaskRequest.model_json_schema()
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_task",
                    "description": "Permanently remove a task",
                    "parameters": DeleteTaskRequest.model_json_schema()
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "update_task",
                    "description": "Update task title and/or description",
                    "parameters": UpdateTaskRequest.model_json_schema()
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_tasks_bulk",
                    "description": "Permanently remove multiple tasks at once, optionally filtered by completion status",
                    "parameters": DeleteTasksBulkRequest.model_json_schema()
                }
            }
        ]

    async def process_request(
        self,
        user_id: int,
        message: str,
        history: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Process a natural language request from a user and return a response.
        
        Args:
            user_id: The ID of the user making the request
            message: The natural language message from the user
            history: Previous conversation history
            
        Returns:
            A dictionary containing the response and any tool calls made
        """
        if history is None:
            history = []
            
        # Prepare the messages for the LLM
        messages = [
            {"role": "system", "content": self._get_system_prompt()},
            *history,
            {"role": "user", "content": message}
        ]
        
        try:
            # Call the LLM with function calling
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=self.tools,
                tool_choice="auto",
                extra_headers={
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "Taskify Bot"
                }
            )
            
            # Process the response
            assistant_message = response.choices[0].message
            result = {
                "response": assistant_message.content or "",
                "tool_calls": [],
                "user_id": user_id
            }
            
            # Execute any tool calls requested by the LLM
            if assistant_message.tool_calls:
                for tool_call in assistant_message.tool_calls:
                    tool_name = tool_call.function.name
                    tool_args = json.loads(tool_call.function.arguments)
                    
                    # Execute the tool and record the result
                    tool_result = await self._execute_tool(tool_name, user_id, **tool_args)
                    result["tool_calls"].append({
                        "name": tool_name,
                        "arguments": tool_args,
                        "result": tool_result
                    })
            
            return result
            
        except Exception as e:
            return {
                "response": f"Sorry, I encountered an error processing your request: {str(e)}",
                "tool_calls": [],
                "user_id": user_id
            }

    def _get_system_prompt(self) -> str:
        """
        Get the system prompt that defines the AI's behavior.
        """
        return """You are Taskify, a helpful todo list assistant. You help users manage their tasks through natural language conversation.

Your Capabilities:
- Create new tasks
- List existing tasks
- Mark tasks as completed
- Update task details
- Delete individual tasks
- Bulk delete tasks (with confirmation for large operations)
- Answer questions about tasks

Tool Usage:
- Use add_task to create new tasks from user requests
- Use list_tasks to retrieve tasks (optionally filter by status: all, completed, incomplete)
- Use complete_task to mark tasks as done
- Use update_task to modify task title or description
- Use delete_task to remove a single task
- Use delete_tasks_bulk to remove multiple tasks at once (for requests like "delete all completed tasks")

Safety Rules:
- If a user requests to delete more than 5 tasks at once, you will receive a CONFIRMATION_REQUIRED error
- When you receive CONFIRMATION_REQUIRED, you must ask the user for explicit confirmation before proceeding
- Only proceed with bulk deletions after the user explicitly confirms

Behavior Rules:
1. Always confirm actions with friendly, conversational responses
2. When users reference "the first one" or similar, use context from conversation history
3. If a task ID is not provided but needed, try to infer from recent conversation or task title
4. For ambiguous requests, ask clarifying questions
5. Handle errors gracefully - if a task is not found, offer to list tasks or create a new one
6. Keep responses concise and friendly
7. Do not mention technical details like tool names or database operations to users
8. When CONFIRMATION_REQUIRED error occurs, explain the situation to the user and ask for explicit permission

Examples:
- User: "Remind me to call mom tomorrow"
  → Use add_task(title="call mom tomorrow") → "I've added 'call mom tomorrow' to your list!"

- User: "What's on my list?"
  → Use list_tasks() → Format and present the tasks

- User: "I finished calling mom"
  → Search recent tasks for title match → Use complete_task(task_id=X) → "Great! I've marked 'call mom tomorrow' as done."

- User: "Delete the first one"
  → Reference conversation history to identify task → Use delete_task(task_id=X) → "Done! I've removed 'Task Title' from your list."

- User: "Delete all completed tasks" (when there are more than 5 completed tasks)
  → Use delete_tasks_bulk(status="completed") → Receive CONFIRMATION_REQUIRED → "You have 7 completed tasks. Are you sure you want to delete all of them?"

- User: "Yes, delete them all" (after confirmation was requested)
  → Use delete_tasks_bulk(status="completed") → "I've successfully deleted 7 completed tasks from your list."

Error Handling:
- TASK_NOT_FOUND: "I couldn't find that task. Would you like to see your current tasks instead?"
- INVALID_INPUT: "That doesn't look quite right. Can you try rephrasing?"
- DATABASE_ERROR: "I'm having trouble accessing your tasks right now. Please try again in a moment."
- UNAUTHORIZED: "I can't access that task. It might belong to another user."
- CONFIRMATION_REQUIRED: "This action affects multiple tasks. [Specific message about what will happen]. Are you sure you want to proceed?"
"""

    async def _execute_tool(self, tool_name: str, user_id: int, **kwargs) -> Dict[str, Any]:
        """
        Execute a tool with the given arguments.
        
        In a real implementation, this would call the actual backend services.
        For this example, we'll simulate the tool execution.
        """
        # In a real implementation, you would import and call the actual service functions
        # from your backend services here.
        
        # Simulate different tool behaviors
        if tool_name == "add_task":
            # In real implementation, this would call the todo service to create a task
            return {
                "success": True,
                "message": f"Task '{kwargs.get('title', 'Untitled')}' added successfully",
                "task_id": 123  # Simulated task ID
            }
        elif tool_name == "list_tasks":
            # In real implementation, this would fetch tasks from the database
            return {
                "success": True,
                "tasks": [
                    {"id": 1, "title": "Sample task", "completed": False},
                    {"id": 2, "title": "Another task", "completed": True}
                ]
            }
        elif tool_name == "complete_task":
            # In real implementation, this would update a task as completed
            return {
                "success": True,
                "message": f"Task {kwargs.get('task_id')} marked as completed"
            }
        elif tool_name == "delete_task":
            # In real implementation, this would delete a task
            return {
                "success": True,
                "message": f"Task {kwargs.get('task_id')} deleted successfully"
            }
        elif tool_name == "update_task":
            # In real implementation, this would update a task
            return {
                "success": True,
                "message": f"Task {kwargs.get('task_id')} updated successfully"
            }
        elif tool_name == "delete_tasks_bulk":
            # In real implementation, this would bulk delete tasks
            return {
                "success": True,
                "message": "Bulk deletion completed successfully"
            }
        else:
            return {
                "success": False,
                "error": f"Unknown tool: {tool_name}"
            }


# Example usage
async def main():
    bot = TaskifyBot()
    
    # Example conversation
    result = await bot.process_request(
        user_id=1,
        message="Add a task to buy groceries",
        history=[]
    )
    
    print("Response:", result["response"])
    print("Tool calls:", result["tool_calls"])


if __name__ == "__main__":
    asyncio.run(main())