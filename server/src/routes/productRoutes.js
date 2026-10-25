const express = require('express');
const { getProducts, getManagedProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/', getProducts);
router.get('/manage', protect, getManagedProducts);
router.post('/', protect, upload.array('images', 10), createProduct);
router.patch('/:productId', protect, updateProduct);
router.delete('/:productId', protect, deleteProduct);

module.exports = router;
