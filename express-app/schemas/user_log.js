// express-app/schemas/user_log.js
const Joi = require('joi');

const userLogReadSchema = Joi.object({
  id: Joi.number().integer().required(),
  method: Joi.string().required(),
  path: Joi.string().required(),
  status_code: Joi.number().integer().required(),
  duration: Joi.number().required(),
  timestamp: Joi.date().iso().required(),
  ip: Joi.string().allow(null).optional(),
  user_agent: Joi.string().allow(null).optional(),
});

module.exports = {
  userLogReadSchema,
};