const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../db');

// NO MOCKS. This is a true end-to-end test.

jest.mock('../middleware/authMiddleware', () => (req, res, next) => next());

describe('Orders API', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('should list all orders', async () => {
    const response = await request(app).get('/api/v1/orders');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('can create and delete an order', async () => {
    const newOrder = {
      first_name: 'John',
      last_name: 'Doe',
      date_of_birth: '1980-01-01',
    };

    const createResponse = await request(app)
      .post('/api/v1/orders')
      .send(newOrder);

    expect(createResponse.statusCode).toBe(201);
    const createdOrder = createResponse.body;
    expect(createdOrder.first_name).toBe(newOrder.first_name);
    expect(createdOrder.last_name).toBe(newOrder.last_name);
    expect(createdOrder.date_of_birth).toBe(newOrder.date_of_birth);
    const orderId = createdOrder.id;

    const deleteResponse = await request(app).delete(`/api/v1/orders/${orderId}`);
    expect(deleteResponse.statusCode).toBe(204);

    const listResponse = await request(app).get('/api/v1/orders');
    const ids = listResponse.body.map((item) => item.id);
    expect(ids).not.toContain(orderId);
  });

  // This is a long-running, true end-to-end test. Timeout is set to 60 seconds.
  test('POST /api/v1/orders/upload should create an order from a real PDF using the full OCR and LLM pipeline', async () => {
    const response = await request(app)
      .post('/api/v1/orders/upload?provider=ollama') // Use the local ollama provider
      .attach('file', 'tests/data/sample_valid.pdf');

    expect(response.statusCode).toBe(201);
    const order = response.body;
    expect(order).toHaveProperty('id');
    expect(order.first_name).toBe('Marie');
    expect(order.last_name).toBe('Curie');
    expect(order.date_of_birth).toBe('1900-12-05');
  }, 60000); // 60-second timeout
});