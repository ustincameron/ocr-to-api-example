from fastapi import FastAPI
from app.api.v1.endpoints import orders
from app.api.v1.endpoints import user_logs
from app.middleware.logging_middleware import log_requests
from app.config.settings import settings
from app.db.session import engine
from app.db import models

app = FastAPI(title="GenHealth API", version="1.0")

# Create tables
models.Base.metadata.create_all(bind=engine)

# Middleware
app.middleware("http")(log_requests)

# Routes
app.include_router(orders.router, prefix="/api/v1/orders", tags=["Orders"])
app.include_router(user_logs.router, prefix="/api/v1/user-logs", tags=["User Logs"])
