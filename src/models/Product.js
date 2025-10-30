import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // Added trim to remove whitespace
  description: { type: String, trim: true },
  price: { 
    type: Number, 
    required: true, 
    min: [0, 'Price must be non-negative'] // Prevent negative prices
  },
  imageUrl: { type: String, required: true },
  stock: { 
    type: Number, 
    required: true, 
    default: 0, 
    min: [0, 'Stock must be non-negative'] // Prevent negative stock
  },
}, { 
  timestamps: true,
  // Optional: Index for faster searches
  indexes: [{ name: 1 }, { price: 1 }]
});

const Product = mongoose.model('Product', productSchema);
export default Product;