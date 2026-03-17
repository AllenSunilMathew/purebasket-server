const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ['percent', 'flat'], default: 'flat' },
  discountValue: { type: Number, required: true },
  minPurchase: { type: Number, default: 0 },
  freeDelivery: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  usageLimit: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  expiryDate: { type: Date }
});

module.exports = mongoose.model('Coupon', couponSchema);
