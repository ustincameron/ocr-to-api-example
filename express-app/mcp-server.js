const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const logger = require('./config/logger');
const { listOrders, createOrderFromPdf } = require('./mcp-tools');

const server = new McpServer({
  name: "express-app-mcp",
  version: "1.0.0",
});

server.tool(
  "listOrders",
  "List all orders in the system",
  {},
  listOrders
);

server.tool(
  "createOrderFromPdf",
  "Create an order by uploading a PDF document",
  { filePath: z.string().describe("The absolute path to the PDF file on the local filesystem") },
  createOrderFromPdf
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

// Only run main if the script is executed directly
if (require.main === module) {
  main();
}

module.exports = server;