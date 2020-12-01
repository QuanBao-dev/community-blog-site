const Joi = require("@hapi/joi");
const validatePostDataUpdate = (data) => {
  const schema = Joi.object({
    tags: Joi.array(),
    title: Joi.string(),
    excerpt: Joi.string(),
  });
  return schema.validate(data);
};

const validatePostCreate = (data) => {
  const checkData = { ...data };
  checkData.body = JSON.parse(checkData.body);
  const schema = Joi.object({
    body: Joi.object({
      blocks: Joi.array().required(),
      entityMap: Joi.object().required(),
    }).required(),
    tags: Joi.array().min(1).required(),
    excerpt: Joi.string().required(),
    title: Joi.string().required(),
    isCompleted: Joi.boolean().required(),
    postId: Joi.string().required(),
    colorStyleMapString:Joi.string().required()
  });
  return schema.validate(checkData);
};

module.exports.validatePostDataUpdate = validatePostDataUpdate;
module.exports.validatePostCreate = validatePostCreate;
