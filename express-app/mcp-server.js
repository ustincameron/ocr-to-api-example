require('dotenv').config();
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const fs = require("fs");
const FormData = require("form-data");
const logger = require('./config/logger');

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost";
const API_PORT = process.env.PORT || 3000;
const API_BEARER_TOKEN = process.env.API_BEARER_TOKEN; // Read the token from environment
const mcpApiUrl = `${API_BASE_URL}:${API_PORT}/api/v1`;

const server = new McpServer({
  name: "express-app-mcp",
  version: "1.0.0",
});

// Use a dynamic import for node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const getHeaders = (form = null) => {
  const headers = {};
  if (API_BEARER_TOKEN) {
    headers['Authorization'] = `Bearer ${API_BEARER_TOKEN}`;
  }
  if (form) {
    return { ...headers, ...form.getHeaders() };
  }
  headers['Content-Type'] = 'application/json';
  return headers;
};

server.tool(
  "listOrders",
  "List all orders in the system",
  {},
  async () => {
    try {
      const response = await fetch(`${mcpApiUrl}/orders`, {
        headers: getHeaders(),
      });
      if (!response.ok) {
        const errorText = await response.text();
        return { content: [{ type: "text", text: `Error fetching orders: ${response.status} ${response.statusText} - ${errorText}` }] };
      }
      const data = await response.json();
      const ordersText = data.map(order => 
        `Order ID: ${order.id}, Name: ${order.first_name} ${order.last_name}, DOB: ${order.date_of_birth}`
      ).join(`
`);

      return {
        content: [
          {
            type: "text",
            text: ordersText || "No orders found.",
          },
        ],
      };
    } catch (err) {
      logger.error(err);
      return { content: [{ type: "text", text: `Failed to fetch from the Express API: ${err.message}` }] };
    }
  }
);

server.tool(
  "createOrderFromPdf",
  "Create an order by uploading a PDF document",
  { filePath: z.string().describe("The absolute path to the PDF file on the local filesystem") },
  async ({ filePath }) => {
    try {
      if (!fs.existsSync(filePath)) {
        return { content: [{ type: "text", text: `Error: File not found at path: ${filePath}` }] };
      }
      
      const form = new FormData();
      form.append("file", fs.createReadStream(filePath));

      const response = await fetch(`${mcpApiUrl}/orders/upload`, {
        method: "POST",
        body: form,
        headers: getHeaders(form),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { content: [{ type: "text", text: `Error creating order: ${response.status} ${response.statusText} - ${errorText}` }] };
      }
      
      const data = await response.json();

      return {
        content: [
          {
            type: "text",
            text: `Order created successfully. Order ID: ${data.id}, Name: ${data.first_name} ${data.last_name}, DOB: ${data.date_of_birth}`,
          },
        ],
      };
    } catch (err) {
      logger.error(err);
      return { content: [{ type: "text", text: `Failed to create order from PDF: ${err.message}` }] };
    }
  }
);

async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info("MCP Server connected and listening for tools.");
  } catch (error) {
    logger.error("Failed to start MCP Server:", error);
    process.exit(1);
  }
}

main();
