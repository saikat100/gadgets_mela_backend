import SubCategory from '../models/SubCategory.js';

export const listSubCategories = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.categoryId) {
      filter.category = req.query.categoryId;
    }
    const subcats = await SubCategory.find(filter)
      .populate('category', 'name slug')
      .sort({ name: 1 });
    res.json(subcats);
  } catch (err) {
    next(err);
  }
};

export const createSubCategory = async (req, res, next) => {
  try {
    const { name, description, categoryId } = req.body;
    if (!categoryId) return res.status(400).json({ message: 'categoryId is required' });
    const exists = await SubCategory.findOne({ name, category: categoryId });
    if (exists) return res.status(409).json({ message: 'Subcategory already exists for this category' });
    const subcat = new SubCategory({ name, description, category: categoryId });
    await subcat.save();
    res.status(201).json(subcat);
  } catch (err) {
    next(err);
  }
};

export const deleteSubCategory = async (req, res, next) => {
  try {
    const deleted = await SubCategory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Subcategory not found' });
    res.json({ message: 'Subcategory deleted' });
  } catch (err) {
    next(err);
  }
};


