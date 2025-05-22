# app/middleware/logging_middleware.py
from starlette.requests import Request
from app.db.session import SessionLocal
from sqlalchemy import text
import time


async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    db = SessionLocal()
    try:
        db.execute(
            text("""
                INSERT INTO user_logs (method, path, status_code, duration, ip, user_agent)
                VALUES (:method, :path, :status, :duration, :ip, :user_agent)
            """),
            {
                "method": request.method,
                "path": request.url.path,
                "status": response.status_code,
                "duration": process_time,
                "ip": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent"),
            },
        )
        db.commit()
    finally:
        db.close()

    return response
