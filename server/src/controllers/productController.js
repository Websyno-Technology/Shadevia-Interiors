const Product = require('../models/Product');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

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
    if (!name || price === undefined || !category) return res.status(400).json({ message: 'Product name, price, and category are required.' });
    if (!req.files?.length) return res.status(400).json({ message: 'Upload at least one product image.' });
    if (!isCloudinaryConfigured()) return res.status(500).json({ message: 'Cloudinary is not configured on the server.' });

    const images = await Promise.all(req.files.map(uploadToCloudinary));

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category: category.toLowerCase(),
      tags: String(tags || '').split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean),
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

    const { price, isVisible, stockStatus } = req.body;
    if (price !== undefined) product.price = Number(price);
    if (typeof isVisible === 'boolean') product.isVisible = isVisible;
    if (['in_stock', 'out_of_stock'].includes(stockStatus)) product.stockStatus = stockStatus;

    await product.save();
    return res.json({ product: productFields(product) });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getProducts, getManagedProducts, createProduct, updateProduct };
