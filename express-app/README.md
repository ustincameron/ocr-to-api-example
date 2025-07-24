# OCR to API with Express.js and MCP

This project is a comprehensive backend service built with Express.js. It is a port of an original FastAPI application, designed to extract structured data from PDF documents, manage database records, and expose its functionality via both a standard REST API and the Model Context Protocol (MCP) for AI integration.

## Overview

The application is composed of two main parts that run concurrently:

1.  **Express.js REST API:** A robust API for performing CRUD operations on Orders and logging user activity. All endpoints are protected and require a bearer token.
2.  **MCP Server:** A protocol server that wraps the Express API, exposing its key features as callable "tools" for AI environments like Cursor.

## Features

- **PDF Processing:** Upload a PDF to extract structured data.
- **Email Confirmation:** Automatically sends a confirmation email via AWS SES after an order is created.
- **Order Management:** Full CRUD functionality for Orders.
- **Request Logging:** Automatically logs all HTTP requests for auditing.
- **Authentication:** API endpoints are protected via bearer token authentication.
- **Database:** Uses PostgreSQL with Sequelize as the ORM.
- **AI Integration:** Exposes API functionality as tools via the Model Context Protocol (MCP).

---

## Getting Started

### Prerequisites

- **Node.js:** Version 20 or higher.
- **Ollama:** Required for PDF data extraction. Ensure the `phi` model is pulled (`ollama pull phi`) and the service is running (`ollama serve`).
- **AWS Account:** An AWS account with SES (Simple Email Service) configured.

### Environment Variables

Before running the application, you must configure your environment. You can create a `.env` file in the `express-app` directory with the following variables:

```
# server.js and database
PORT=3000
DATABASE_URL=postgresql://user:password@host:port/database
BEARER_TOKEN=your-secret-api-token

# services/llmService.js
OPENAI_API_KEY=
GEMINI_API_KEY=
OLLAMA_API_URL=http://localhost:11434

# services/emailService.js
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
EMAIL_FROM_ADDRESS=your-verified-sender@example.com
```

### Installation and Running

1.  **Navigate to the app directory:** `cd express-app`
2.  **Install dependencies:** `npm install`
3.  **Start the application:** `npm start`

---

## API Endpoints

All endpoints require a valid Bearer Token.

- `POST /api/v1/orders/upload` – Upload a PDF and an email address to create an order and send a confirmation.
- ... (and all other existing endpoints)

---

## AI (MCP) Integration with Cursor

Create an `mcp.json` file in the project root to connect to Cursor.

```json
{
  "mcpServers": {
    "express-app-mcp": {
      "command": "/absolute/path/to/node",
      "args": ["/absolute/path/to/project/express-app/mcp-server.js"],
      "env": {
        "PORT": "3000",
        "API_BEARER_TOKEN": "your-secret-api-token"
      }
    }
  }
}
```
**Note:** Ensure the `API_BEARER_TOKEN` in `mcp.json` matches the `BEARER_TOKEN` in your `.env` file.

---
## Screenshots

### 📤 Postman Upload Example
![Postman Screenshot](../screenshots/postman.png)

### 📚 Swagger `/docs`
![Swagger Screenshot](../screenshots/swagger.png)
