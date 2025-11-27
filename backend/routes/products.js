const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const verifyToken = require('../middlewares/authMiddleware');
const verifyRole = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// === PUBLIC ROUTES (Ai cũng xem được) ===
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// === ADMIN ROUTES (Phải đăng nhập & là Admin) ===

// Tạo sản phẩm mới (Có upload nhiều ảnh, tối đa 5 ảnh)
router.post('/', 
    verifyToken, 
    verifyRole('Admin'), 
    upload.array('images', 5), 
    productController.createProduct
);

// Cập nhật sản phẩm
router.put('/:id', 
    verifyToken, 
    verifyRole('Admin'), 
    productController.updateProduct
);

// Xóa sản phẩm
router.delete('/:id', 
    verifyToken, 
    verifyRole('Admin'), 
    productController.deleteProduct
);

module.exports = router;