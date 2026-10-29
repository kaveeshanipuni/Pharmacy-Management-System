const { check, body, validationResult } = require('express-validator');

// Result checker middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    return res.status(400).json({
      message: 'Validation failed. Please verify the submitted data.',
      errors: extractedErrors,
    });
  }
  next;
  return next();
};

// Register validation rules: validate name, email, password >= 6
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors,
];

// Login validation rules
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

// Profile update validation rules
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('currentPassword')
    .optional()
    .notEmpty()
    .withMessage('Current password is required to set a new password'),
  body('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  handleValidationErrors,
];

// Medicine validation rules: name (required), category, price (>= 0), stock (integer >= 0), expiryDate, description, imageUrl
const validateMedicine = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Medicine name is required')
    .isLength({ max: 120 })
    .withMessage('Name cannot exceed 120 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a number greater than or equal to 0'),
  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be an integer greater than or equal to 0'),
  body('expiryDate')
    .notEmpty()
    .withMessage('Expiry date is required')
    .isISO8601()
    .withMessage('Expiry date must be a valid date format (YYYY-MM-DD)'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
  body('imageUrl')
    .optional()
    .isString()
    .withMessage('Image URL must be a valid string'),
  handleValidationErrors,
];

// Order validation rules: address, items array with medicine ID and qty >= 1
const validateOrder = [
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Delivery address is required')
    .isLength({ min: 5 })
    .withMessage('Address should be at least 5 characters long'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.medicine')
    .notEmpty()
    .withMessage('Medicine ID is required for each item')
    .isMongoId()
    .withMessage('Invalid Medicine ID format'),
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer at least 1'),
  handleValidationErrors,
];

// Order status validation rules
const validateOrderStatus = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Pending', 'Completed', 'Cancelled'])
    .withMessage('Status must be one of: Pending, Completed, Cancelled'),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateMedicine,
  validateOrder,
  validateOrderStatus,
};
