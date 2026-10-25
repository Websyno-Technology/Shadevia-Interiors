const Product = require('../models/Product');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const { isAllowedCategory, areAllowedTags } = require('../config/catalog');

const uploadToCloudinary = (file) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { folder: 'shadevia-interiors/products', resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
    (error, result) => error ? reject(error) : resolve(result.secure_url)
  );
  stream.end(file.buffer);
});

const productFields = (product) => ({
  id: product._id,
  name: product.name,
  description: product.description,
  category: product.category,
  tags: product.tags,
  price: product.price,
  images: product.images,
  isVisible: product.isVisible,
  stockStatus: product.stockStatus,
  createdAt: product.createdAt
});

const getProducts = async (req, res, next) => {
  try {
    const filters = { isVisible: true, stockStatus: 'in_stock' };
    if (req.query.category) filters.category = String(req.query.category).toLowerCase();
    const products = await Product.find(filters).sort({ createdAt: -1 });
    res.json({ products: products.map(productFields) });
  } catch (error) {
    next(error);
  }
};

const getManagedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json({ products: products.map(productFields) });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, tags } = req.body;
    const normalizedCategory = String(category || '').trim().toLowerCase();
    const normalizedTags = String(tags || '').split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean);
    if (!name?.trim() || price === undefined || !category?.trim() || !description?.trim()) return res.status(400).json({ message: 'Product name, price, category, and description are required.' });
    if (!isAllowedCategory(normalizedCategory)) return res.status(400).json({ message: 'Choose a category from the approved list.' });
    if (normalizedTags.length > 12 || !areAllowedTags(normalizedTags)) return res.status(400).json({ message: 'Choose tags from the approved list.' });
    if (!req.files?.length) return res.status(400).json({ message: 'Upload at least one product image.' });
    if (!isCloudinaryConfigured()) return res.status(500).json({ message: 'Cloudinary is not configured on the server.' });

    const images = await Promise.all(req.files.map(uploadToCloudinary));

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category: normalizedCategory,
      tags: normalizedTags,
      images,
      createdBy: req.user.id
    });
    return res.status(201).json({ product: productFields(product) });
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.productId, createdBy: req.user.id });
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const { name, description, price, category, tags, isVisible, stockStatus } = req.body;
    if (name !== undefined) {
      if (!String(name).trim()) return res.status(400).json({ message: 'Product name is required.' });
      product.name = String(name).trim();
    }
    if (description !== undefined) {
      if (!String(description).trim()) return res.status(400).json({ message: 'Product description is required.' });
      product.description = String(description).trim();
    }
    if (price !== undefined) {
      if (!Number.isFinite(Number(price)) || Number(price) < 0) return res.status(400).json({ message: 'Enter a valid price.' });
      product.price = Number(price);
    }
    if (category !== undefined) {
      const normalizedCategory = String(category).trim().toLowerCase();
      if (!isAllowedCategory(normalizedCategory)) return res.status(400).json({ message: 'Choose a category from the approved list.' });
      product.category = normalizedCategory;
    }
    if (tags !== undefined) {
      const normalizedTags = Array.isArray(tags) ? tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean) : [];
      if (normalizedTags.length > 12 || !areAllowedTags(normalizedTags)) return res.status(400).json({ message: 'Choose tags from the approved list.' });
      product.tags = normalizedTags;
    }
    if (typeof isVisible === 'boolean') product.isVisible = isVisible;
    if (['in_stock', 'out_of_stock'].includes(stockStatus)) product.stockStatus = stockStatus;

    await product.save();
    return res.json({ product: productFields(product) });
  } catch (error) {
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.productId, createdBy: req.user.id });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

module.exports = { getProducts, getManagedProducts, createProduct, updateProduct, deleteProduct };
