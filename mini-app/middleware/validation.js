const { body, validationResult } = require('express-validator');

exports.validateLogin = [
  body('initData').notEmpty().withMessage('Init data required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.sanitizeInput = (fields) => {
  return fields.map(field => body(field).trim().escape());
};