const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { authMiddleware, staffOrAdmin } = require('../middleware/auth');

// Place order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, paymentMethod, deliveryType, address, couponCode } = req.body;
    let totalAmount = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        totalAmount += product.price * item.quantity;
        orderItems.push({ product: product._id, name: product.name, price: product.price, quantity: item.quantity, image: product.image });
        product.soldCount += item.quantity;
        await product.save();
      }
    }
    let discount = 0;
    let deliveryCharge = totalAmount >= 1000 ? 0 : 40;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && totalAmount >= coupon.minPurchase) {
        if (coupon.discountType === 'percent') discount = Math.round(totalAmount * coupon.discountValue / 100);
        else discount = coupon.discountValue;
        if (coupon.freeDelivery) deliveryCharge = 0;
        coupon.usedCount++;
        await coupon.save();
      }
    }
    // Offers
    if (totalAmount >= 400) discount = Math.max(discount, 50);
    const packagingCharge = 5;
    const finalAmount = totalAmount - discount + deliveryCharge + packagingCharge;
    const order = await Order.create({ user: req.user._id, items: orderItems, totalAmount, discount, deliveryCharge, packagingCharge, finalAmount, couponCode, paymentMethod, deliveryType, address });
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user orders
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders (staff/admin)
router.get('/all', authMiddleware, staffOrAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status (staff/admin)
router.put('/:id/status', authMiddleware, staffOrAdmin, async (req, res) => {
  try {
    const { status, staffNote } = req.body;
    const update = { status };
    if (staffNote) update.staffNote = staffNote;
    if (status === 'packing') update.packedAt = new Date();
    if (status === 'delivered') update.deliveredAt = new Date();
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ message: 'Order updated', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel order (user, only within 1 minute)
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const diff = (new Date() - new Date(order.createdAt)) / 1000;
    if (diff > 60) return res.status(400).json({ message: 'Cannot cancel after 1 minute' });
    order.status = 'cancelled';
    await order.save();
    res.json({ message: 'Order cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
