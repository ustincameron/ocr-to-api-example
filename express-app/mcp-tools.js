const fs = require("fs");
const FormData = require("form-data");
const config = require('./config');
const logger = require('./config/logger');

// Use a dynamic import for node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const getHeaders = (form = null) => {
  const API_BEARER_TOKEN = process.env.API_BEARER_TOKEN;
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

const mcpApiUrl = `${config.api.baseUrl}:${config.api.port}/api/v1`;

const listOrders = async () => {
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
};

const createOrderFromPdf = async ({ filePath }) => {
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
};

module.exports = {
  listOrders,
  createOrderFromPdf,
};