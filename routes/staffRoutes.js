const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authMiddleware, staffOrAdmin } = require('../middleware/auth');

// Staff: get pending/packing orders
router.get('/orders', authMiddleware, staffOrAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ status: { $in: ['pending', 'confirmed', 'packing'] } })
      .populate('user', 'name phone address')
      .sort({ createdAt: 1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
