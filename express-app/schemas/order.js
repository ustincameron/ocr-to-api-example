const Joi = require('joi');

const orderSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  date_of_birth: Joi.date().iso().required(),
});

const orderReadSchema = orderSchema.keys({
    id: Joi.number().integer().required(),
    document_path: Joi.string().allow(null),
    createdAt: Joi.date().iso().required(),
    updatedAt: Joi.date().iso().required(),
});

module.exports = {
  orderSchema,
  orderReadSchema,
};
