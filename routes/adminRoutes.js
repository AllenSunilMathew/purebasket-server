const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Dashboard stats
router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalStaff = await User.countDocuments({ role: 'staff' });
    const totalProducts = await Product.countDocuments();
    const orders = await Order.find();
    const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.finalAmount, 0);
    const todayOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    }).length;
    // Monthly data
    const monthlyData = {};
    for (const order of orders) {
      const month = new Date(order.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthlyData[month]) monthlyData[month] = { revenue: 0, orders: 0 };
      if (order.status !== 'cancelled') monthlyData[month].revenue += order.finalAmount;
      monthlyData[month].orders++;
    }
    res.json({ totalUsers, totalStaff, totalProducts, totalRevenue, todayOrders, monthlyData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create staff
router.post('/staff', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const tokenId = 'PM' + String(Math.floor(Math.random() * 900 + 100));
    const staff = await User.create({ name, email, password: hashed, phone, role: 'staff', tokenId });
    res.status(201).json({ message: 'Staff created', staff: { name: staff.name, email: staff.email, tokenId } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all staff
router.get('/staff', authMiddleware, adminOnly, async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('-password');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Top selling products
router.get('/top-products', authMiddleware, adminOnly, async (req, res) => {
  try {
    const products = await Product.find().sort({ soldCount: -1 }).limit(10);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
