const Order = require('../models/Order');
const Medicine = require('../models/Medicine');

// @desc    Place a new order with atomic stock check & decrement and rollback on failure
// @route   POST /api/orders
// @access  Customer
const placeOrder = async (req, res, next) => {
  const { items, address } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order must contain at least one item.' });
  }

  // Track successfully decremented items for rollback in case a later item fails
  const decrementedItems = [];

  try {
    const orderItems = [];
    let calculatedTotal = 0;

    // 1. Process each item: fetch genuine medicine data from DB (never trust client prices!)
    for (const item of items) {
      const { medicine: medicineId, quantity } = item;
      const qty = parseInt(quantity, 10);

      if (!qty || qty <= 0) {
        throw new Error('Invalid item quantity.');
      }

      // Check current medicine details for snapshot
      const medicine = await Medicine.findById(medicineId);
      if (!medicine) {
        throw new Error(`Medicine with ID ${medicineId} does not exist.`);
      }

      // Atomic stock check and decrement:
      // only succeeds if current stock is >= requested quantity
      const updatedMedicine = await Medicine.findOneAndUpdate(
        { _id: medicineId, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { new: true }
      );

      if (!updatedMedicine) {
        // Stock was insufficient at the moment of atomic decrement
        throw new Error(
          `Insufficient stock for "${medicine.name}". Available stock: ${medicine.stock}, requested: ${qty}.`
        );
      }

      // Keep record of decremented item for potential rollback
      decrementedItems.push({ medicineId, qty });

      // Build embedded snapshot
      orderItems.push({
        medicine: medicine._id,
        nameSnapshot: medicine.name,
        priceSnapshot: medicine.price,
        quantity: qty,
      });

      calculatedTotal += medicine.price * qty;
    }

    // 2. Round total amount to 2 decimal places
    calculatedTotal = Math.round(calculatedTotal * 100) / 100;

    // 3. Create and save the order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount: calculatedTotal,
      address: address.trim(),
      status: 'Pending',
    });

    return res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    console.warn('[Order Controller] Order placement failed, initiating rollback:', error.message);

    // Rollback earlier decrements if any item failed
    for (const decremented of decrementedItems) {
      try {
        await Medicine.findByIdAndUpdate(decremented.medicineId, {
          $inc: { stock: decremented.qty },
        });
      } catch (rollbackErr) {
        console.error(
          `[Order Controller] Rollback failed for medicine ${decremented.medicineId}:`,
          rollbackErr.message
        );
      }
    }

    return res.status(400).json({
      message: error.message || 'Failed to place order due to inventory constraint.',
    });
  }
};

// @desc    Get order history for current customer
// @route   GET /api/orders/my
// @access  Customer
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a Pending order (Customer) and restore stock
// @route   PATCH /api/orders/:id/cancel
// @access  Customer
const cancelMyOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.status !== 'Pending') {
      return res.status(400).json({
        message: `Cannot cancel an order with status "${order.status}". Only Pending orders can be cancelled.`,
      });
    }

    // Restore stock for all items
    for (const item of order.items) {
      if (item.medicine) {
        await Medicine.findByIdAndUpdate(item.medicine, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.status = 'Cancelled';
    await order.save();

    return res.status(200).json({
      message: 'Order cancelled successfully and stock restored to inventory.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== 'All') {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const [total, orders] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    return res.status(200).json({
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin: e.g. mark Completed or Cancelled)
// @route   PATCH /api/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const previousStatus = order.status;

    // If changing from Pending to Cancelled, restore stock
    if (previousStatus === 'Pending' && status === 'Cancelled') {
      for (const item of order.items) {
        if (item.medicine) {
          await Medicine.findByIdAndUpdate(item.medicine, {
            $inc: { stock: item.quantity },
          });
        }
      }
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      message: `Order status updated to ${status}.`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  cancelMyOrder,
  getAllOrders,
  updateOrderStatus,
};
