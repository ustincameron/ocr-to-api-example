// express-app/middleware/responseMiddleware.js
const Joi = require('joi');
const logger = require('../config/logger');

const responseMiddleware = (schema) => (req, res, next) => {
  const originalJson = res.json;

  res.json = function (body) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      let validationSchema = schema;
      if (Array.isArray(body)) {
        validationSchema = Joi.array().items(schema);
      }
      
      const { error, value } = validationSchema.validate(body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        logger.error('Response validation error:', error.message);
        return originalJson.call(this, {
          message: 'An unexpected error occurred.',
        });
      }
      return originalJson.call(this, value);
    }
    return originalJson.call(this, body);
  };
  next();
};

module.exports = responseMiddleware;