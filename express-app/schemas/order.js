// express-app/schemas/order.js
const Joi = require('joi');

const orderBaseSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  date_of_birth: Joi.date().iso().required(),
});

const orderCreateSchema = orderBaseSchema;

const orderReadSchema = orderBaseSchema.keys({
  id: Joi.number().integer().required(),
  document_path: Joi.string().allow(null).optional(),
});

module.exports = {
  orderBaseSchema,
  orderCreateSchema,
  orderReadSchema,
};