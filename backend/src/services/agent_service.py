from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
import json

from src.agent.client import get_openrouter_client
from src.agent.instructions import AGENT_INSTRUCTIONS
from src.mcp.server import MCPServer
from src.mcp.schemas import ToolResult
from src.core.config import settings


class AgentService:
    """
    Agent service for processing chat messages with LLM and tool execution.
    Handles communication with OpenRouter and tool coordination.
    """
    def __init__(self, session: AsyncSession, mcp_server: MCPServer):
        self.session = session
        self.mcp_server = mcp_server
        self.client = get_openrouter_client()

    async def execute(
        self,
        user_id: int,
        history: List[Dict[str, str]],
        message: str
    ) -> Dict[str, Any]:
        """
        Execute agent logic: call LLM, process tool calls, return final response.
        """
        messages = [
            {"role": "system", "content": AGENT_INSTRUCTIONS},
            *history,
            {"role": "user", "content": message}
        ]

        tools = [
            {
                "type": "function",
                "function": {
                    "name": "add_task",
                    "description": "Create a new todo task for the user",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "Task title (required, non-empty)"
                            },
                            "description": {
                                "type": "string",
                                "description": "Optional task description with additional details"
                            },
                            "priority": {
                                "type": "string",
                                "enum": ["high", "medium", "low"],
                                "description": "Task priority level (default: medium)"
                            },
                            "tags": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "List of tags for categorizing the task"
                            },
                            "due_date": {
                                "type": "string",
                                "format": "date-time",
                                "description": "Due date for the task in ISO format (YYYY-MM-DDTHH:MM:SS.sssZ)"
                            },
                            "recurrence": {
                                "type": "string",
                                "enum": ["daily", "weekly", "monthly", "yearly"],
                                "description": "Recurrence pattern for the task"
                            }
                        },
                        "required": ["title"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_tasks",
                    "description": "Retrieve user's tasks, optionally filtered by completion status",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "status": {
                                "type": "string",
                                "enum": ["all", "completed", "incomplete"],
                                "description": "Filter tasks by completion status"
                            }
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "complete_task",
                    "description": "Mark a task as completed",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {
                                "type": "integer",
                                "description": "ID of the task to mark as completed"
                            }
                        },
                        "required": ["task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_task",
                    "description": "Permanently remove a task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {
                                "type": "integer",
                                "description": "ID of the task to delete"
                            }
                        },
                        "required": ["task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "update_task",
                    "description": "Update task with any combination of fields",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {
                                "type": "integer",
                                "description": "ID of the task to update"
                            },
                            "title": {
                                "type": "string",
                                "description": "New task title (optional)"
                            },
                            "description": {
                                "type": "string",
                                "description": "New task description (optional)"
                            },
                            "priority": {
                                "type": "string",
                                "enum": ["high", "medium", "low"],
                                "description": "New task priority level (optional)"
                            },
                            "tags": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "New list of tags for categorizing the task (optional)"
                            },
                            "due_date": {
                                "type": "string",
                                "format": "date-time",
                                "description": "New due date for the task in ISO format (optional)"
                            },
                            "recurrence": {
                                "type": "string",
                                "enum": ["daily", "weekly", "monthly", "yearly"],
                                "description": "New recurrence pattern for the task (optional)"
                            }
                        },
                        "required": ["task_id"]
                    }
                }
            }
        ]

        # Add delete by name tool
        tools.append({
            "type": "function",
            "function": {
                "name": "delete_task_by_name",
                "description": "Permanently remove a task by its title/name",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "description": "Title or partial title of the task to delete"
                        }
                    },
                    "required": ["title"]
                }
            }
        })

        # Add bulk delete tool
        tools.append({
            "type": "function",
            "function": {
                "name": "delete_tasks_bulk",
                "description": "Permanently remove multiple tasks at once, optionally filtered by completion status",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "status": {
                            "type": "string",
                            "enum": ["all", "completed", "incomplete"],
                            "description": "Filter tasks by completion status for bulk deletion"
                        }
                    }
                }
            }
        })

        try:
            # Check if API key is properly configured
            if not settings.OPENROUTER_API_KEY or settings.OPENROUTER_API_KEY.startswith("sk-or-v1-placeholder"):
                # Return a mock response when API key is not configured
                print("OpenRouter API key not configured, returning mock response")
                return {
                    "response": "Hello! I'm the Tasklyn Chatbot. To enable full AI functionality, please configure your OpenRouter API key in the environment variables.",
                    "tool_calls": []
                }
            
            # Call OpenRouter LLM
            # OpenRouter requires HTTP-Referer and X-Title for full functionality
            response = await self.client.chat.completions.create(
                model=settings.OPENROUTER_MODEL,
                messages=messages,
                tools=tools,
                tool_choice="auto",
                extra_headers={
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "Taskify App"
                }
            )
        except Exception as e:
            # Log the real OpenRouter error for debugging
            print(f"Agent Execution Error (LLM Call): {type(e).__name__}: {str(e)}")
            # Re-raise the exception to be handled by the chat route for proper error response
            raise e

        if not response.choices:
             return {
                "response": "I received an empty response from the assistant. Please try again.",
                "tool_calls": []
            }

        assistant_message = response.choices[0].message
        tool_calls_result = []

        # Process tool calls if requested by the LLM
        if assistant_message.tool_calls:
            for tool_call in assistant_message.tool_calls:
                try:
                    tool_name = tool_call.function.name

                    # Log for debugging
                    print(f"Executing tool: {tool_name} with args: {tool_call.function.arguments}")

                    tool_args = json.loads(tool_call.function.arguments)

                    # Inject user context into tool arguments
                    tool_args["user_id"] = user_id

                    # Check for bulk operations that require confirmation
                    if tool_name == "delete_tasks_bulk":
                        from src.mcp.tools.bulk_operation_guard import BulkOperationGuard
                        guard = BulkOperationGuard(self.session)

                        # Check if this operation requires confirmation
                        requires_confirmation, reason_msg = await guard.requires_confirmation(
                            user_id=user_id,
                            operation_type="delete_tasks",
                            operation_params=tool_args
                        )

                        if requires_confirmation:
                            # Instead of executing, return a confirmation request
                            result = ToolResult(
                                success=False,
                                error='CONFIRMATION_REQUIRED',
                                message=reason_msg,
                                data={}
                            )
                        else:
                            # Execute the tool if no confirmation needed
                            result = await self.mcp_server.execute_tool(
                                tool_name=tool_name,
                                session=self.session,
                                **tool_args
                            )
                    else:
                        result = await self.mcp_server.execute_tool(
                            tool_name=tool_name,
                            session=self.session,
                            **tool_args
                        )

                    tool_calls_result.append({
                        "tool": tool_name,
                        "arguments": tool_args,
                        "result": result.model_dump()
                    })
                except Exception as tool_err:
                    print(f"Tool Execution Error ({tool_name}): {str(tool_err)}")
                    # Continue with other tool calls or return partial results

        return {
            "response": assistant_message.content or "",
            "tool_calls": tool_calls_result
        }
