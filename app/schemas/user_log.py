# app/schemas/user_log.py
from pydantic import BaseModel
from datetime import datetime

class UserLogRead(BaseModel):
    id: int
    method: str
    path: str
    status_code: int
    duration: float
    timestamp: datetime
    ip: str | None = None
    user_agent: str | None = None

    class Config:
        from_attributes = True
