import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { 
    type: Number, 
    required: true, 
    min: [0, 'Price must be non-negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount must be non-negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  imageUrl: { type: String, required: true },
  stock: { 
    type: Number, 
    required: true, 
    default: 0, 
    min: [0, 'Stock must be non-negative']
  },
}, { 
  timestamps: true,
  indexes: [{ name: 1 }, { price: 1 }]
});

const Product = mongoose.model('Product', productSchema);
export default Product;