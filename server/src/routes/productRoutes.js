const express = require('express');
const { getProducts, getManagedProducts, createProduct, updateProduct } = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/', getProducts);
router.get('/manage', protect, getManagedProducts);
router.post('/', protect, upload.array('images', 10), createProduct);
router.patch('/:productId', protect, updateProduct);

module.exports = router;
