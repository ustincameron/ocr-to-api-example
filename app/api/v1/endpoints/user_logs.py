# app/api/v1/endpoints/user_logs.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user_log import UserLog
from datetime import datetime

router = APIRouter()


@router.get("/", response_model=list[dict])
def list_user_logs(db: Session = Depends(get_db)):
    logs = db.query(UserLog).order_by(UserLog.id.desc()).limit(100).all()
    return [
        {
            "id": log.id,
            "method": log.method,
            "path": log.path,
            "status_code": log.status_code,
            "duration": round(log.duration, 3),
            "timestamp": log.timestamp.isoformat()
            if isinstance(log.timestamp, datetime)
            else log.timestamp,
            "ip": log.ip,
            "user_agent": log.user_agent,
        }
        for log in logs
    ]
