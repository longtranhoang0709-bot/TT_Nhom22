const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ACCESS_KEY = "access_secret_key_123";
const REFRESH_KEY = "refresh_secret_key_789"; 

// 1. ĐĂNG KÝ 
router.post('/register', (req, res) => {
    const { email, password, full_name } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!email || !password || !full_name) {
        return res.status(400).json("Vui lòng điền đầy đủ thông tin!");
    }

    // Kiểm tra Email tồn tại
    const checkQuery = "SELECT * FROM users WHERE email = ?";
    db.query(checkQuery, [email], (err, data) => {
        if (err) return res.status(500).json({ error: "Lỗi Server", details: err });
        if (data.length > 0) return res.status(409).json("Email này đã được sử dụng!");

        // Mã hóa mật khẩu
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const insertQuery = "INSERT INTO users (`email`, `password`, `full_name`, `role`) VALUES (?)";
        const values = [email, hashedPassword, full_name, 'customer'];

        db.query(insertQuery, [values], (err, data) => {
            if (err) return res.status(500).json({ error: "Lỗi tạo tài khoản", details: err });
            return res.status(200).json("Đăng ký thành công!");
        });
    });
});

// 2. ĐĂNG NHẬP
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) return res.status(400).json("Chưa nhập email hoặc mật khẩu!");

    const q = "SELECT * FROM users WHERE email = ?";
    db.query(q, [email], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("Tài khoản không tồn tại!");

        // Check pass
        const isPasswordCorrect = bcrypt.compareSync(password, data[0].password);
        if (!isPasswordCorrect) return res.status(400).json("Sai mật khẩu!");

        // --- TẠO TOKEN ---
        // Access Token: Sống ngắn (15 phút)
        const accessToken = jwt.sign({ id: data[0].id, role: data[0].role }, ACCESS_KEY, { expiresIn: '15m' });
        
        // Refresh Token: Sống dài (7 ngày)
        const refreshToken = jwt.sign({ id: data[0].id, role: data[0].role }, REFRESH_KEY, { expiresIn: '7d' });

        const { password: userPass, ...otherInfo } = data[0];

        // Gửi Refresh Token vào Cookie (An toàn hơn gửi JSON)
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true, // JS không đọc được (chống XSS)
            secure: false,  // localhost thì để false, lên https thì để true
            sameSite: "strict"
        })
        .status(200)
        .json({ ...otherInfo, accessToken }); // Chỉ gửi Access Token về JSON
    });
});

// 3. REFRESH TOKEN (Cấp lại Access Token mới)
router.post('/refresh', (req, res) => {
    // Lấy Refresh Token từ Cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(401).json("Bạn chưa đăng nhập! (Không có Refresh Token)");

    // Kiểm tra xem Refresh Token có hợp lệ không
    jwt.verify(refreshToken, REFRESH_KEY, (err, user) => {
        if (err) return res.status(403).json("Token không hợp lệ hoặc đã hết hạn!");

        // Nếu đúng, tạo Access Token MỚI
        const newAccessToken = jwt.sign({ id: user.id, role: user.role }, ACCESS_KEY, { expiresIn: '15m' });

        // Trả Access Token mới về
        res.status(200).json({ accessToken: newAccessToken });
    });
});

// 4. LOGOUT (Xóa Cookie)
router.post('/logout', (req, res) => {
    res.clearCookie("refreshToken", {
        sameSite: "none",
        secure: true
    }).status(200).json("Đăng xuất thành công!");
});

module.exports = router;