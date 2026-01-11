from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class TestModel(SQLModel, table=True):
    __tablename__ = 'test'
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now, nullable=False)

print('Test model creation successful')