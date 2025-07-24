const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('An error occurred:', err); // Log the error

  const statusCode = err.statusCode || 500; // Use the error's status code or default to 500
  const message = err.message || 'Internal Server Error'; // Use the error's message or a generic one

  res.status(statusCode).json({
    message: message,
    // Include error details in development, but not in production
    ...(process.env.NODE_ENV === 'development' && { error: err }),
  });
};

module.exports = errorHandler;
