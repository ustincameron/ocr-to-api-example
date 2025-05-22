# app/models/user_log.py
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.db.base import Base
from datetime import datetime


class UserLog(Base):
    __tablename__ = "user_logs"

    id = Column(Integer, primary_key=True, index=True)
    method = Column(String, nullable=False)
    path = Column(String, nullable=False)
    status_code = Column(Integer, nullable=False)
    duration = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    ip = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
