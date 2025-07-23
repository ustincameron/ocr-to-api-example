const Joi = require('joi');

const orderSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  date_of_birth: Joi.date().iso().required(),
});

module.exports = {
  orderSchema,
};
