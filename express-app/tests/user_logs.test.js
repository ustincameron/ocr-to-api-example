const request = require('supertest');
const app = require('../app');
const { sequelize, UserLog } = require('../db');

jest.mock('../middleware/authMiddleware', () => (req, res, next) => next());

describe('User Logs API', () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true });
        await UserLog.bulkCreate([
            { method: 'GET', path: '/api/v1/orders', status_code: 200, duration: 50.25, timestamp: new Date(), ip: '127.0.0.1', user_agent: 'jest' },
            { method: 'POST', path: '/api/v1/orders', status_code: 201, duration: 100.10, timestamp: new Date(), ip: '127.0.0.1', user_agent: 'jest' },
        ]);
    });
    
    test('GET /api/v1/user_logs should return all user logs', async () => {
        const response = await request(app).get('/api/v1/user_logs');
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2);
    });
});
