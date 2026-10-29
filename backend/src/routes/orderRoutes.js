const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  cancelMyOrder,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');
const { validateOrder, validateOrderStatus } = require('../middleware/validate');

// Customer routes (Protected)
router.post('/', protect, validateOrder, placeOrder);
router.get('/my', protect, getMyOrders);
router.patch('/:id/cancel', protect, cancelMyOrder);

// Admin routes (Protected + AdminOnly)
router.get('/', protect, adminOnly, getAllOrders);
router.patch('/:id/status', protect, adminOnly, validateOrderStatus, updateOrderStatus);

module.exports = router;
