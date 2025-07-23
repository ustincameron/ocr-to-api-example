const request = require('supertest');
const app = require('../app');
const { sequelize, UserLog } = require('../db'); // Import UserLog model

// Before running tests, synchronize the database and potentially create test data
beforeAll(async () => {
  await sequelize.sync({ force: true }); // This will drop existing tables and recreate them
  // Create some dummy user logs for testing
  await UserLog.bulkCreate([
    { method: 'GET', path: '/api/v1/orders', status_code: 200, duration: 50.25, timestamp: new Date(), ip: '127.0.0.1', user_agent: 'jest' },
    { method: 'POST', path: '/api/v1/orders', status_code: 201, duration: 100.10, timestamp: new Date(), ip: '127.0.0.1', user_agent: 'jest' },
  ]);
});

// After running tests, close the database connection
afterAll(async () => {
  await sequelize.close();
});

describe('User Logs API', () => {
  // Test GET all user logs
  test('GET /api/v1/user_logs should return all user logs', async () => {
    const response = await request(app).get('/api/v1/user_logs');
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2); // Expecting 2 dummy user logs
  });

  // Test GET a specific user log by ID
  test('GET /api/v1/user_logs/:user_log_id should return a specific user log', async () => {
    // Assuming user log with ID 1 exists from bulkCreate
    const userLogId = 1;
    const response = await request(app).get(`/api/v1/user_logs/${userLogId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id', userLogId);
    expect(response.body.method).toBe('GET');
  });

  // Test GET a non-existing user log by ID
  test('GET /api/v1/user_logs/:user_log_id should return 404 if user log not found', async () => {
    const nonExistingUserLogId = 999;
    const response = await request(app).get(`/api/v1/user_logs/${nonExistingUserLogId}`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('message', 'User log not found');
  });
});
