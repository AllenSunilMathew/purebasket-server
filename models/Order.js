const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  totalAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  deliveryCharge: { type: Number, default: 0 },
  packagingCharge: { type: Number, default: 5 },
  finalAmount: { type: Number, required: true },
  couponCode: { type: String },
  paymentMethod: { type: String, enum: ['cod', 'upi'], default: 'cod' },
  deliveryType: { type: String, enum: ['home', 'store'], default: 'home' },
  address: { type: String },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'packing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  staffNote: { type: String },
  packedAt: { type: Date },
  deliveredAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
