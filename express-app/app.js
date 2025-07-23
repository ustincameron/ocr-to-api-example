const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express'); // Import swagger-ui-express
const swaggerSpec = require('./swaggerDef'); // Import swaggerDef

// Middleware
app.use(express.json()); // For parsing application/json

// Import middleware
const loggingMiddleware = require('./middleware/loggingMiddleware');
const errorHandler = require('./middleware/errorHandler'); // Import error handler

// Use middleware
app.use(loggingMiddleware);

// Import routes
const orderRoutes = require('./api/v1/endpoints/orders');
const userLogRoutes = require('./api/v1/endpoints/user_logs');

// Use routes
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/user_logs', userLogRoutes);

// Serve Swagger UI documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// Use error handling middleware (should be the last middleware)
app.use(errorHandler);


module.exports = app;
