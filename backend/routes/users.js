const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); 
const verifyToken = require('../middlewares/authMiddleware'); 
const verifyRole = require('../middlewares/roleMiddleware');

// 1. GET ALL: Chỉ Admin
router.get('/', verifyToken, verifyRole('Admin'), userController.getAllUsers);

// 2. GET BY ID: Đăng nhập là xem được
router.get('/:id', verifyToken, userController.getUserById);

// 3. POST: Admin tạo user
router.post('/', verifyToken, verifyRole('Admin'), userController.createUser);

// 4. PUT: Update thông tin
router.put('/:id', verifyToken, userController.updateUser);

// 5. DELETE: Chỉ Admin xóa
router.delete('/:id', verifyToken, verifyRole('Admin'), userController.deleteUser);

module.exports = router;