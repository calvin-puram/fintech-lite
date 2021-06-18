const joi = require('joi');

export const validateUser = (username, password) => {
  const schema = joi.object({
    username: joi.string().required(),
    password: joi.string().required(),
  });

  const validation = schema.validate({ username, password });
  if (validation.error) {
    return {
      success: false,
      error: validation.error.details[0].message,
    };
  }
};

export const validateAmount = (accountId, amount) => {
  const schema = joi.object({
    accountId: joi.number().required(),
    amount: joi.number().min(1).required(),
  });
  const validation = schema.validate({ accountId, amount });
  if (validation.error) {
    return {
      success: false,
      error: validation.error.details[0].message,
    };
  }
};

export const TransferAmount = (senderId, recipientId, amount) => {
  const schema = joi.object({
    senderId: joi.number().required(),
    recipientId: joi.number().required(),
    amount: joi.number().min(1).required(),
  });
  const validation = schema.validate({ senderId, recipientId, amount });
  if (validation.error) {
    return {
      success: false,
      error: validation.error.details[0].message,
    };
  }
};
