const request = require('supertest');
const app = require('../app'); // Assuming your Express app is exported from app.js
const { sequelize } = require('../db'); // Assuming your sequelize instance is exported from db/index.js

// Before running tests, synchronize the database and potentially create test data
beforeAll(async () => {
  await sequelize.sync({ force: true }); // This will drop existing tables and recreate them
  // TODO: Add any necessary test data creation here
});

// After running tests, close the database connection
afterAll(async () => {
  await sequelize.close();
});

describe('Orders API', () => {
  // Test GET all orders
  test('GET /api/v1/orders should return an empty array initially', async () => {
    const response = await request(app).get('/api/v1/orders');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  // Test POST a new order
  test('POST /api/v1/orders should create a new order', async () => {
    const newOrder = {
      first_name: 'John',
      last_name: 'Doe',
      date_of_birth: '1990-05-15',
    };
    const response = await request(app)
      .post('/api/v1/orders')
      .send(newOrder);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.first_name).toBe(newOrder.first_name);
  });

  // Test GET a specific order by ID
  test('GET /api/v1/orders/:order_id should return a specific order', async () => {
    // Assuming an order with ID 1 exists from the previous POST test
    const orderId = 1;
    const response = await request(app).get(`/api/v1/orders/${orderId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id', orderId);
  });

  // Test PUT update an order by ID
  test('PUT /api/v1/orders/:order_id should update an order', async () => {
    // Assuming an order with ID 1 exists
    const orderId = 1;
    const updatedOrderData = {
      first_name: 'Jane',
    };
    const response = await request(app)
      .put(`/api/v1/orders/${orderId}`)
      .send(updatedOrderData);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id', orderId);
    expect(response.body.first_name).toBe(updatedOrderData.first_name);
  });

  // Test DELETE an order by ID
  test('DELETE /api/v1/orders/:order_id should delete an order', async () => {
    // Assuming an order with ID 1 exists
    const orderId = 1;
    const response = await request(app).delete(`/api/v1/orders/${orderId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', `Order with ID ${orderId} deleted`);

    // Verify the order is deleted
    const getResponse = await request(app).get(`/api/v1/orders/${orderId}`);
    expect(getResponse.statusCode).toBe(404);
  });

  // TODO: Add tests for POST /api/v1/orders/upload
  // This will require mocking the file upload, OCR, and LLM services
});
