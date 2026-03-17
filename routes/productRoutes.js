const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Get all products (with optional category/search filter)
router.get('/', async (req, res) => {
  try {
    const { category, search, offer } = req.query;
    let query = {};
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (offer) query.isOffer = true;
    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add product (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ message: 'Product added', product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update product (admin)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Product updated', product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete product (admin)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed initial products
router.post('/seed/all', async (req, res) => {
  try {
    await Product.deleteMany({});
    const products = getSeedProducts();
    await Product.insertMany(products);
    res.json({ message: `${products.length} products seeded` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

function getSeedProducts() {
  const categories = {
    'Fruits': [
      { name: 'Apple', price: 80, originalPrice: 100, unit: 'kg', tags: ['fresh', 'vitamin-c'], nutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, vitamins: 'Vitamin C, B6',image:"data:image/jpeg;base64,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" } },
      { name: 'Banana', price: 40, originalPrice: 50, unit: 'dozen', tags: ['energy', 'potassium'], nutrition: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, vitamins: 'Vitamin B6, C' } },
      { name: 'Orange', price: 60, originalPrice: 80, unit: 'kg', tags: ['vitamin-c', 'immunity'], nutrition: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, vitamins: 'Vitamin C, A' } },
      { name: 'Mango', price: 120, originalPrice: 150, unit: 'kg', tags: ['tropical', 'sweet'], nutrition: { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, vitamins: 'Vitamin A, C' } },
      { name: 'Grapes', price: 90, originalPrice: 110, unit: 'kg', tags: ['antioxidant'], nutrition: { calories: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9, vitamins: 'Vitamin C, K' } },
      { name: 'Pineapple', price: 70, originalPrice: 90, unit: 'piece', tags: ['tropical'], nutrition: { calories: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4, vitamins: 'Vitamin C, B1' } },
      { name: 'Papaya', price: 55, originalPrice: 70, unit: 'piece', tags: ['digestive'], nutrition: { calories: 43, protein: 0.5, carbs: 11, fat: 0.3, fiber: 1.7, vitamins: 'Vitamin C, A' } },
      { name: 'Watermelon', price: 35, originalPrice: 50, unit: 'kg', tags: ['hydrating'], nutrition: { calories: 30, protein: 0.6, carbs: 8, fat: 0.2, fiber: 0.4, vitamins: 'Vitamin A, C' } },
      { name: 'Pomegranate', price: 150, originalPrice: 180, unit: 'kg', tags: ['antioxidant'], nutrition: { calories: 83, protein: 1.7, carbs: 19, fat: 1.2, fiber: 4, vitamins: 'Vitamin C, K' } },
      { name: 'Guava', price: 50, originalPrice: 65, unit: 'kg', tags: ['vitamin-c'], nutrition: { calories: 68, protein: 2.6, carbs: 14, fat: 1, fiber: 5.4, vitamins: 'Vitamin C, B3' } }
    ],
    'Vegetables': [
      { name: 'Tomato', price: 30, unit: 'kg', nutrition: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, vitamins: 'Vitamin C, K' } },
      { name: 'Potato', price: 25, unit: 'kg', nutrition: { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, vitamins: 'Vitamin C, B6' } },
      { name: 'Onion', price: 30, unit: 'kg', nutrition: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, vitamins: 'Vitamin C, B6' } },
      { name: 'Carrot', price: 35, unit: 'kg', nutrition: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, vitamins: 'Vitamin A, K' } },
      { name: 'Spinach', price: 25, unit: 'bunch', nutrition: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, vitamins: 'Vitamin K, A' } },
      { name: 'Broccoli', price: 60, unit: 'piece', tags: ['diet', 'protein'], nutrition: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, vitamins: 'Vitamin C, K' } },
      { name: 'Cucumber', price: 20, unit: 'piece', nutrition: { calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, vitamins: 'Vitamin K, C' } },
      { name: 'Capsicum', price: 40, unit: 'piece', nutrition: { calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1, vitamins: 'Vitamin C, A' } },
      { name: 'Cabbage', price: 25, unit: 'piece', nutrition: { calories: 25, protein: 1.3, carbs: 6, fat: 0.1, fiber: 2.5, vitamins: 'Vitamin C, K' } },
      { name: 'Cauliflower', price: 35, unit: 'piece', tags: ['diet', 'keto'], nutrition: { calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2, vitamins: 'Vitamin C, K' } },
    ],
    'Grains & Staples': [
      { name: 'Rice', price: 60, unit: 'kg', nutrition: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, vitamins: 'Vitamin B1, B3' } },
      { name: 'Wheat Flour (Atta)', price: 45, unit: 'kg', nutrition: { calories: 340, protein: 13, carbs: 72, fat: 2.5, fiber: 10, vitamins: 'Vitamin B1, B3' } },
      { name: 'Maida', price: 38, unit: 'kg', nutrition: { calories: 364, protein: 10, carbs: 76, fat: 1, fiber: 2.7, vitamins: 'Vitamin B1' } },
      { name: 'Rava (Semolina)', price: 40, unit: 'kg', nutrition: { calories: 360, protein: 13, carbs: 73, fat: 1, fiber: 3.9, vitamins: 'Vitamin B1, B2' } },
      { name: 'Oats', price: 120, unit: 'kg', tags: ['diet', 'fiber'], nutrition: { calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 10.6, vitamins: 'Vitamin B1, B5' } },
      { name: 'Poha', price: 35, unit: 'kg', nutrition: { calories: 300, protein: 5, carbs: 65, fat: 1, fiber: 0.9, vitamins: 'Vitamin B1' } },
      { name: 'Quinoa', price: 250, unit: 'kg', tags: ['protein', 'diet', 'superfood'], nutrition: { calories: 368, protein: 14, carbs: 64, fat: 6, fiber: 7, vitamins: 'Vitamin B1, B2, E' } },
    ],
    'Bakery': [
      { name: 'Bread', price: 45, unit: 'loaf', nutrition: { calories: 265, protein: 9, carbs: 51, fat: 3.2, fiber: 2.7, vitamins: 'Vitamin B1, B2' } },
      { name: 'Brown Bread', price: 55, unit: 'loaf', tags: ['diet', 'fiber'], nutrition: { calories: 247, protein: 13, carbs: 41, fat: 3.4, fiber: 7, vitamins: 'Vitamin B1, B6' } },
      { name: 'Buns', price: 30, unit: 'pack', nutrition: { calories: 278, protein: 8, carbs: 49, fat: 5, fiber: 1.5, vitamins: 'Vitamin B1' } },
      { name: 'Croissants', price: 80, unit: 'pack', nutrition: { calories: 406, protein: 9, carbs: 46, fat: 21, fiber: 2.1, vitamins: 'Vitamin A, B1' } },
      { name: 'Muffins', price: 60, unit: 'pack', nutrition: { calories: 367, protein: 6, carbs: 55, fat: 14, fiber: 1.8, vitamins: 'Vitamin B1, B2' } },
      { name: 'Cookies', price: 50, unit: 'pack', nutrition: { calories: 480, protein: 5, carbs: 66, fat: 22, fiber: 1.5, vitamins: 'Vitamin B1' } },
      { name: 'Donuts', price: 70, unit: 'pack', nutrition: { calories: 452, protein: 5, carbs: 51, fat: 25, fiber: 1, vitamins: 'Vitamin B1' } },
    ],
    'Dairy': [
      { name: 'Milk', price: 60, unit: 'litre', nutrition: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, vitamins: 'Vitamin D, B12' } },
      { name: 'Curd (Yogurt)', price: 45, unit: '500g', tags: ['probiotic', 'protein'], nutrition: { calories: 59, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0, vitamins: 'Vitamin B12, D' } },
      { name: 'Butter', price: 55, unit: '100g', nutrition: { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0, vitamins: 'Vitamin A, D' } },
      { name: 'Cheese', price: 120, unit: '200g', tags: ['protein', 'calcium'], nutrition: { calories: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0, vitamins: 'Vitamin A, B12' } },
      { name: 'Paneer', price: 90, unit: '200g', tags: ['protein', 'vegetarian'], nutrition: { calories: 265, protein: 18, carbs: 3.4, fat: 20, fiber: 0, vitamins: 'Vitamin A, D' } },
      { name: 'Cream', price: 65, unit: '200ml', nutrition: { calories: 340, protein: 2.1, carbs: 2.9, fat: 36, fiber: 0, vitamins: 'Vitamin A, D' } },
      { name: 'Flavoured Milk', price: 35, unit: '200ml', nutrition: { calories: 112, protein: 3.4, carbs: 17, fat: 3.3, fiber: 0, vitamins: 'Vitamin D, B12' } },
    ],
    'Packaged Food': [
      { name: 'Instant Noodles', price: 15, unit: 'pack', nutrition: { calories: 380, protein: 8, carbs: 56, fat: 14, fiber: 2, vitamins: 'Vitamin B1, B2' } },
      { name: 'Pasta', price: 60, unit: 'pack', nutrition: { calories: 371, protein: 13, carbs: 74, fat: 1.5, fiber: 3.2, vitamins: 'Vitamin B1, B9' } },
      { name: 'Tomato Ketchup', price: 80, unit: 'bottle', nutrition: { calories: 100, protein: 1, carbs: 25, fat: 0.2, fiber: 0.3, vitamins: 'Vitamin C' } },
      { name: 'Mayonnaise', price: 90, unit: 'jar', nutrition: { calories: 680, protein: 1, carbs: 2.4, fat: 75, fiber: 0, vitamins: 'Vitamin E, K' } },
      { name: 'Baked Beans', price: 70, unit: 'can', tags: ['protein', 'fiber'], nutrition: { calories: 155, protein: 9, carbs: 27, fat: 0.5, fiber: 7, vitamins: 'Vitamin B1, B6' } },
      { name: 'Pickles', price: 50, unit: 'jar', nutrition: { calories: 11, protein: 0.3, carbs: 2.3, fat: 0.2, fiber: 1.1, vitamins: 'Vitamin A, K' } },
    ],
    'Snacks': [
      { name: 'Potato Chips', price: 20, unit: 'pack', nutrition: { calories: 536, protein: 7, carbs: 53, fat: 35, fiber: 5, vitamins: 'Vitamin C, B6' } },
      { name: 'Nachos', price: 30, unit: 'pack', nutrition: { calories: 500, protein: 7, carbs: 62, fat: 26, fiber: 4, vitamins: 'Vitamin B1' } },
      { name: 'Popcorn', price: 15, unit: 'pack', nutrition: { calories: 375, protein: 11, carbs: 74, fat: 4.5, fiber: 14.5, vitamins: 'Vitamin B1, B6' } },
      { name: 'Chocolate', price: 40, unit: 'bar', nutrition: { calories: 546, protein: 5, carbs: 60, fat: 31, fiber: 7, vitamins: 'Vitamin B12, E' } },
      { name: 'Energy Bars', price: 60, unit: 'piece', tags: ['gym', 'protein'], nutrition: { calories: 400, protein: 20, carbs: 45, fat: 10, fiber: 5, vitamins: 'Vitamin B complex' } },
    ],
    'Beverages': [
      { name: 'Soft Drinks', price: 40, unit: 'bottle', nutrition: { calories: 140, protein: 0, carbs: 39, fat: 0, fiber: 0, vitamins: '' } },
      { name: 'Fruit Juice', price: 60, unit: 'carton', nutrition: { calories: 45, protein: 0.7, carbs: 11, fat: 0.2, fiber: 0.2, vitamins: 'Vitamin C, A' } },
      { name: 'Tea', price: 120, unit: 'pack', tags: ['antioxidant'], nutrition: { calories: 1, protein: 0, carbs: 0.3, fat: 0, fiber: 0, vitamins: '' } },
      { name: 'Coffee', price: 180, unit: 'pack', tags: ['energy'], nutrition: { calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0, vitamins: '' } },
      { name: 'Energy Drinks', price: 80, unit: 'can', tags: ['gym', 'energy'], nutrition: { calories: 110, protein: 1, carbs: 28, fat: 0, fiber: 0, vitamins: 'Vitamin B3, B6' } },
      { name: 'Mineral Water', price: 20, unit: 'bottle', nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, vitamins: '' } },
      { name: 'Coconut Water', price: 35, unit: 'pack', tags: ['hydrating', 'electrolytes'], nutrition: { calories: 19, protein: 0.7, carbs: 3.7, fat: 0.2, fiber: 1.1, vitamins: 'Vitamin C, B complex' } },
    ],
    'Household': [
      { name: 'Dishwashing Liquid', price: 75, unit: 'bottle' },
      { name: 'Laundry Detergent', price: 120, unit: 'kg' },
      { name: 'Floor Cleaner', price: 90, unit: 'bottle' },
      { name: 'Glass Cleaner', price: 85, unit: 'bottle' },
      { name: 'Garbage Bags', price: 60, unit: 'pack' },
      { name: 'Tissue Paper', price: 40, unit: 'pack' },
      { name: 'Aluminium Foil', price: 55, unit: 'roll' },
      { name: 'Kitchen Sponge', price: 30, unit: 'pack' },
      { name: 'Air Freshener', price: 150, unit: 'can' },
    ],
    'Personal Care': [
      { name: 'Soap', price: 35, unit: 'bar', tags: ['hygiene'] },
      { name: 'Shampoo', price: 120, unit: 'bottle' },
      { name: 'Conditioner', price: 130, unit: 'bottle' },
      { name: 'Toothpaste', price: 55, unit: 'tube' },
      { name: 'Toothbrush', price: 30, unit: 'piece' },
      { name: 'Face Wash', price: 110, unit: 'tube' },
      { name: 'Body Lotion', price: 150, unit: 'bottle' },
      { name: 'Deodorant', price: 160, unit: 'piece' },
    ],
    'Frozen Foods': [
      { name: 'Ice Cream', price: 120, unit: 'tub', tags: ['dessert'], nutrition: { calories: 207, protein: 3.5, carbs: 24, fat: 11, fiber: 0.7, vitamins: 'Vitamin A, B12' } },
      { name: 'Frozen Vegetables', price: 80, unit: 'pack', nutrition: { calories: 65, protein: 3, carbs: 12, fat: 0.5, fiber: 4, vitamins: 'Vitamin A, C' } },
      { name: 'Frozen Chicken Nuggets', price: 200, unit: 'pack', nutrition: { calories: 250, protein: 15, carbs: 16, fat: 14, fiber: 0.6, vitamins: 'Vitamin B12' } },
      { name: 'Frozen French Fries', price: 150, unit: 'pack', nutrition: { calories: 312, protein: 3.4, carbs: 41, fat: 15, fiber: 3.8, vitamins: 'Vitamin C, B6' } },
      { name: 'Frozen Pizza', price: 280, unit: 'piece', nutrition: { calories: 285, protein: 12, carbs: 36, fat: 10, fiber: 2, vitamins: 'Vitamin A, C' } },
    ],
    'Others': [
      { name: 'Eggs', price: 90, unit: 'dozen', tags: ['protein', 'gym'], nutrition: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, vitamins: 'Vitamin D, B12' } },
      { name: 'Pen', price: 10, unit: 'piece' },
      { name: 'Pencil', price: 5, unit: 'piece' },
    ]
  };

  const products = [];
  for (const [category, items] of Object.entries(categories)) {
    for (const item of items) {
      products.push({
        ...item,
        category,
        originalPrice: item.originalPrice || Math.round(item.price * 1.2),
        isOffer: Math.random() > 0.6,
        offerPercent: [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)],
        image: `https://source.unsplash.com/300x300/?${encodeURIComponent(item.name)},food`,
        tags: item.tags || ['fresh', 'quality'],
        description: `Fresh and high quality ${item.name} from PureBasket. Best for daily use.`
      });
    }
  }
  return products;
}

module.exports = router;
