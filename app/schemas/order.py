# app/schemas/order.py
from pydantic import BaseModel, ConfigDict
from datetime import date


class OrderBase(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date


class OrderCreate(OrderBase):
    pass


class OrderRead(OrderBase):
    id: int
    document_path: str | None = None

    model_config = ConfigDict(from_attributes=True)
