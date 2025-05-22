# tests/test_orders.py
from fastapi.testclient import TestClient
from app.main import app
from datetime import date
import io

client = TestClient(app)


def test_list_orders():
    response = client.get("/api/v1/orders/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_and_delete_order():
    # Create order
    payload = {
        "first_name": "John",
        "last_name": "Doe",
        "date_of_birth": "1980-01-01"
    }
    create_resp = client.post("/api/v1/orders/", json=payload)
    assert create_resp.status_code == 200
    data = create_resp.json()
    assert data["first_name"] == "John"
    assert data["last_name"] == "Doe"
    assert data["date_of_birth"] == "1980-01-01"
    order_id = data["id"]

    # Delete order
    delete_resp = client.delete(f"/api/v1/orders/{order_id}")
    assert delete_resp.status_code == 204

    # Confirm deletion
    list_resp = client.get("/api/v1/orders/")
    ids = [item["id"] for item in list_resp.json()]
    assert order_id not in ids


def test_upload_order_document():
    with open("tests/data/sample_valid.pdf", "rb") as f:
        files = {"file": ("sample_valid.pdf", f, "application/pdf")}
        response = client.post("/api/v1/orders/upload", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "Marie"
    assert data["last_name"] == "Curie"
    assert data["date_of_birth"] == "1900-12-05"

