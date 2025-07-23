const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express Order and User Log API',
      version: '1.0.0',
      description: 'API documentation for the Express.js order and user log application',
    },
    servers: [
      {
        url: '/api/v1',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: "Enter the token 'fake-valid-token' to authenticate.",
        },
      },
      schemas: {
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            date_of_birth: { type: 'string', format: 'date' },
            document_path: { type: 'string' },
          },
        },
        UserLog: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            method: { type: 'string' },
            path: { type: 'string' },
            status_code: { type: 'integer' },
            duration: { type: 'number' },
            timestamp: { type: 'string', format: 'date-time' },
            ip: { type: 'string' },
            user_agent: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./api/v1/endpoints/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
