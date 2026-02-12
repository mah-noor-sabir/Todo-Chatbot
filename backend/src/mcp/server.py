from typing import Callable, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from src.mcp.schemas import ToolResult
from src.mcp.tools.add_task import add_task
from src.mcp.tools.list_tasks import list_tasks, delete_tasks_bulk
from src.mcp.tools.complete_task import complete_task
from src.mcp.tools.delete_task import delete_task
from src.mcp.tools.delete_task_by_name import delete_task_by_name
from src.mcp.tools.update_task import update_task


class MCPServer:
    def __init__(self):
        self.tools: Dict[str, Callable] = {}
        self._register_default_tools()

    def _register_default_tools(self) -> None:
        self.register_tool("add_task", add_task)
        self.register_tool("list_tasks", list_tasks)
        self.register_tool("complete_task", complete_task)
        self.register_tool("delete_task", delete_task)
        self.register_tool("delete_task_by_name", delete_task_by_name)
        self.register_tool("delete_tasks_bulk", delete_tasks_bulk)
        self.register_tool("update_task", update_task)

    def register_tool(self, name: str, tool_func: Callable) -> None:
        self.tools[name] = tool_func

    async def execute_tool(
        self,
        tool_name: str,
        session: AsyncSession,
        **kwargs
    ) -> ToolResult:
        if tool_name not in self.tools:
            return ToolResult(
                success=False,
                error="TOOL_NOT_FOUND",
                message=f"Tool '{tool_name}' not found"
            )

        tool_func = self.tools[tool_name]
        return await tool_func(session=session, **kwargs)
