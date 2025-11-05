import Product from '../models/Product.js';

// GET all products
export const getProducts = async (req, res, next) => {
  try {
    const { category, subCategory, sub, q, search } = req.query;
    const filter = {};
    if (category) {
      filter.category = { $regex: `^${escapeRegex(String(category))}$`, $options: 'i' };
    }
    const subVal = subCategory || sub;
    if (subVal) {
      filter.subCategory = { $regex: `^${escapeRegex(String(subVal))}$`, $options: 'i' };
    }
    const queryText = q || search;
    if (queryText) {
      const rx = { $regex: escapeRegex(String(queryText)), $options: 'i' };
      filter.$or = [{ name: rx }, { description: rx }];
    }
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    next(err); // Pass to central error handler
  }
};

function escapeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET single product by ID
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// POST new product
export const createProduct = async (req, res, next) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    next(err); // Handles validation errors automatically
  }
};

// PUT update product by ID
export const updateProduct = async (req, res, next) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return updated doc
      runValidators: true // Re-run schema validation
    });
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(updatedProduct);
  } catch (err) {
    next(err);
  }
};

// DELETE product by ID
export const deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};