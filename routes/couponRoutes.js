const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Get all coupons (admin)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Validate coupon
router.post('/validate', authMiddleware, async (req, res) => {
  try {
    const { code, amount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });
    if (coupon.expiryDate && new Date() > coupon.expiryDate) return res.status(400).json({ message: 'Coupon expired' });
    if (amount < coupon.minPurchase) return res.status(400).json({ message: `Min purchase ₹${coupon.minPurchase} required` });
    let discount = 0;
    if (coupon.discountType === 'percent') discount = Math.round(amount * coupon.discountValue / 100);
    else discount = coupon.discountValue;
    res.json({ message: 'Coupon applied!', discount, freeDelivery: coupon.freeDelivery });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create coupon (admin)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ message: 'Coupon created', coupon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed default coupons
router.post('/seed', async (req, res) => {
  try {
    await Coupon.deleteMany({});
    await Coupon.insertMany([
      { code: 'WELCOME50', discountType: 'flat', discountValue: 50, minPurchase: 200, freeDelivery: false },
      { code: 'PURE100', discountType: 'flat', discountValue: 100, minPurchase: 500, freeDelivery: false },
      { code: 'FRESH20', discountType: 'percent', discountValue: 20, minPurchase: 300, freeDelivery: false },
      { code: 'FREEDEL', discountType: 'flat', discountValue: 0, minPurchase: 400, freeDelivery: true },
      { code: 'BASKET200', discountType: 'flat', discountValue: 200, minPurchase: 800, freeDelivery: true },
    ]);
    res.json({ message: 'Coupons seeded' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
