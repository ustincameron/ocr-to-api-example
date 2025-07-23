const request = require('supertest');
const app = require('../app');
const pdfParser = require('../services/pdfParser');

jest.mock('../services/pdfParser', () => ({
  extractPatientData: jest.fn(),
}));
jest.mock('../middleware/authMiddleware', () => (req, res, next) => next());

describe('Orders API', () => {
  beforeEach(async () => {
    await sequelize.truncate({ cascade: true });
  });

  test('can create and delete an order', async () => {
    const newOrder = {
      first_name: 'Marie',
      last_name: 'Curie',
      date_of_birth: '1867-11-07',
    };

    const createResponse = await request(app)
      .post('/api/v1/orders')
      .send(newOrder);
    
    expect(createResponse.statusCode).toBe(201);
    const orderId = createResponse.body.id;

    const deleteResponse = await request(app).delete(`/api/v1/orders/${orderId}`);
    expect(deleteResponse.statusCode).toBe(204);
  });

  test('POST /api/v1/orders/upload should create an order from a PDF', async () => {
    pdfParser.extractPatientData.mockResolvedValue({
      first_name: 'Marie',
      last_name: 'Curie',
      date_of_birth: '1867-11-07',
    });

    const response = await request(app)
      .post('/api/v1/orders/upload')
      .attach('file', 'tests/data/sample_valid.pdf');

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.first_name).toBe('Marie');
    expect(response.body.last_name).toBe('Curie');
    expect(response.body.date_of_birth).toBe('1867-11-07');
  });
});
