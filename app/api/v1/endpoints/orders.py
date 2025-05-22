# app/api/v1/endpoints/orders.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.schemas.order import OrderCreate, OrderRead
from app.models.order import Order
from app.db.session import SessionLocal
from app.services.pdf_parser import extract_patient_data
import shutil
import os
from uuid import uuid4
from datetime import datetime

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=OrderRead)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    db_order = Order(**order.model_dump())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


@router.get("/", response_model=list[OrderRead])
def list_orders(db: Session = Depends(get_db)):
    return db.query(Order).all()


@router.post("/upload", response_model=OrderRead)
def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    filename = f"uploaded_{uuid4().hex}.pdf"
    file_path = os.path.join("/tmp", filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    extracted = extract_patient_data(file_path)
    if not extracted:
        raise HTTPException(status_code=400, detail="Failed to extract patient data")
    order = Order(
        first_name=extracted["first_name"],
        last_name=extracted["last_name"],
        date_of_birth=datetime.strptime(extracted["date_of_birth"], "%Y-%m-%d").date(),
        document_path=file_path,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if order:
        db.delete(order)
        db.commit()
    return
