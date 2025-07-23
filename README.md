````md
# OCR to API Example

## Overview
A FastAPI-based backend for extracting structured data from uploaded PDF documents and performing CRUD on Orders.

## Features
- Upload a PDF and extract first name, last name, and date of birth via OCR + LLM
- Create, list, and manage Orders
- Automatic logging of all HTTP requests to a `user_logs` table (method, path, IP, agent, duration)
- PostgreSQL database
- Dockerized for deployment
- Auto-deploy ready via GitHub Actions

## Getting Started

### Developer Commands via Makefile
You can use the included `Makefile` for common workflows:

```bash
make install     # Setup virtual environment and install dependencies
make run         # Start FastAPI app with live reload
make test        # Run test suite
make lint        # Lint code with ruff
make format      # Auto-format code with ruff
make create-db   # Create the database from .env
make reset-db    # Drop and recreate the database
````

### Local Setup

```bash
git clone <repo-url>
cd <repo>
cp .env.example .env
docker build -t ocr-to-api-example .
docker run --env-file .env -p 8000:10000 ocr-to-api-example
```

> Ensure your `.env` file includes a valid `DATABASE_URL` pointing to your PostgreSQL instance.

## LLM Requirements

This app uses [Ollama](https://ollama.com) and the `phi` model to extract patient fields from unstructured OCR'd PDFs.

Install Ollama (CLI-only, no Homebrew):

```bash
curl -L https://github.com/ollama/ollama/releases/download/v0.7.0/ollama-darwin.tgz | tar -xz && chmod +x ollama && sudo mv ollama /usr/local/bin/
```

Then pull the model:

```bash
ollama pull phi
```

Ensure `ollama serve` is running in the background.

### API Docs

Visit: `http://localhost:8000/docs`

### Endpoints

* `GET /api/v1/orders/` – List all orders
* `POST /api/v1/orders/` – Create order manually
* `POST /api/v1/orders/upload` – Upload PDF to create order
* `GET /api/v1/user-logs/` – List recent user request logs

## Deployment

Use the Render dashboard to connect your GitHub repo and deploy via Docker. Use `.env` variables in the dashboard config.

## Running Without Docker

```bash
git clone <repo-url>
cd <repo-name>
cp .env.example .env

python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export $(cat .env | xargs)
uvicorn app.main:app --reload
```
## TODO

- 🔐 **Authentication & Authorization**
    - Add support for authenticated endpoints
    - Implement token-based access (e.g. OAuth2, JWT)
    - Protect logs and upload endpoints by role

- 🧵 **Background Task Processing**
    - Add a job queue system using `pg-boss`, `dramatiq`, or `RQ` (PostgreSQL-backed)
    - Move long-running tasks like PDF parsing and LLM inference to async workers
    - Support task status polling for uploads

## License

MIT

```
```
## Screenshots

### 📤 Postman Upload Example
![Postman Screenshot](screenshots/postman.png)

### 📚 Swagger `/docs`
![Swagger Screenshot](screenshots/swagger.png)
