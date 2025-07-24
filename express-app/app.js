const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerDef');
const loggingMiddleware = require('./middleware/loggingMiddleware');
const errorHandler = require('./middleware/errorHandler');
const apiLimiter = require('./middleware/rateLimiter');
const orderRoutes = require('./api/v1/endpoints/orders');
const userLogRoutes = require('./api/v1/endpoints/user_logs');

// Apply security and performance middleware first
app.use(helmet());
app.use(cors());
app.use(compression());

// Apply general middleware
app.use(express.json());
app.use(loggingMiddleware);

// Apply the rate limiter to API routes
app.use('/api/v1/', apiLimiter);

// API routes
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/user_logs', userLogRoutes);

// Swagger documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root endpoint now serves as the health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
