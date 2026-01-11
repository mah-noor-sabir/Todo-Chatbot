from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from src.mcp.server import MCPServer
from src.mcp.schemas import ToolResult


async def process_tool_calls(
    mcp_server: MCPServer,
    session: AsyncSession,
    user_id: int,
    tool_calls: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    results = []

    for tool_call in tool_calls:
        tool_name = tool_call.get("tool")
        tool_args = tool_call.get("arguments", {})
        tool_args["user_id"] = user_id

        result = await mcp_server.execute_tool(
            tool_name=tool_name,
            session=session,
            **tool_args
        )

        results.append({
            "tool": tool_name,
            "arguments": tool_args,
            "result": result.model_dump()
        })

    return results
