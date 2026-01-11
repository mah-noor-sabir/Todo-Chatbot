from pydantic import BaseModel
from typing import Optional, Any


class ToolResult(BaseModel):
    success: bool
    data: Optional[dict[str, Any]] = None
    error: Optional[str] = None
    message: Optional[str] = None


class ToolError(BaseModel):
    code: str
    description: str
