// express-app/middleware/responseMiddleware.js
const Joi = require('joi');
const logger = require('../config/logger');

const responseMiddleware = (schema) => (req, res, next) => {
  const originalJson = res.json;

  res.json = function (body) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const { error, value } = schema.validate(body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        logger.error('Response validation error:', error);
        return originalJson.call(this, {
          message: 'Internal Server Error: Response validation failed',
          details: error.details.map((d) => d.message),
        });
      }
      return originalJson.call(this, value);
    }
    return originalJson.call(this, body);
  };
  next();
};

module.exports = responseMiddleware;