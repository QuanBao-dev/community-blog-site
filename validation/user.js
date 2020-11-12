const Joi = require("@hapi/joi");

const validateRegister = (data) => {
  const schema = Joi.object({
    username:Joi.string().min(1).required(),
    email:Joi.string().min(6).email().required(),
    password:Joi.string().min(6).required()
  });
  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email:Joi.string().min(6).email().required(),
    password:Joi.string().min(6).required()
  });
  return schema.validate(data);
}

const validateEdit = (data) => {
  const schema = Joi.object({
    currentPassword:Joi.string().min(6).required(),
    newEmail:Joi.string().min(6).email(),
    newPassword:Joi.string().min(6),
    newUsername:Joi.string().min(1)
  });
  return schema.validate(data);
}


module.exports.validateRegister = validateRegister;
module.exports.validateLogin = validateLogin;
module.exports.validateEdit = validateEdit;
