const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const authController = require("../controllers/authController");

const ACCESS_KEY = "access_secret_key_123";
const REFRESH_KEY = "refresh_secret_key_789";

// 1. REGISTER / ĐĂNG KÝ
router.post("/register", async (req, res) => {
  const { email, password, ho_ten, so_dien_thoai, dia_chi } = req.body;

  if (!email || !password || !ho_ten) {
    return res.status(400).json("Vui lòng nhập đủ email, mật khẩu và họ tên!");
  }

  try {
    // Kiểm tra trùng email
    const [exist] = await db.query("SELECT * FROM NGUOI_DUNG WHERE email = ?", [
      email,
    ]);

    if (exist.length > 0) return res.status(409).json("Email đã tồn tại!");

    // Mã hóa mật khẩu
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Tạo UUID
    const userId = uuidv4();

    // Tạo người dùng
    await db.query(
      `INSERT INTO NGUOI_DUNG 
            (ma_nguoi_dung, ho_ten, email, so_dien_thoai, mat_khau_ma_hoa, dia_chi)
            VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        ho_ten,
        email,
        so_dien_thoai || null,
        hashedPassword,
        dia_chi || null,
      ]
    );

    // GÁN VAI TRÒ mặc định: CUSTOMER
    await db.query(
      "INSERT INTO NGUOI_DUNG_VAI_TRO (ma_nguoi_dung, ma_vai_tro) VALUES (?, ?)",
      [userId, 1]
    );

    res.status(201).json("Đăng ký thành công!");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server", detail: err });
  }
});

// 2. LOGIN / ĐĂNG NHẬP
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json("Vui lòng nhập email và mật khẩu!");

  try {
    // Lấy thông tin user
    const [rows] = await db.query("SELECT * FROM NGUOI_DUNG WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0)
      return res.status(404).json("Tài khoản không tồn tại!");

    const user = rows[0];

    // Kiểm tra mật khẩu
    const match = bcrypt.compareSync(password, user.mat_khau_ma_hoa);
    if (!match) return res.status(400).json("Sai mật khẩu!");

    // Lấy vai trò (user có thể nhiều role)
    const [roles] = await db.query(
      `SELECT V.ten_vai_tro 
              FROM NGUOI_DUNG_VAI_TRO NVT
              JOIN VAI_TRO V ON NVT.ma_vai_tro = V.ma_vai_tro
              WHERE NVT.ma_nguoi_dung = ?`,
      [user.ma_nguoi_dung]
    );

    const roleNames = roles.map((r) => r.ten_vai_tro);

    // Tạo Access Token
    const accessToken = jwt.sign(
      {
        id: user.ma_nguoi_dung,
        roles: roleNames,
      },
      ACCESS_KEY,
      { expiresIn: "60m" }
    );

    // Tạo Refresh Token
    const refreshToken = jwt.sign(
      {
        id: user.ma_nguoi_dung,
        roles: roleNames,
      },
      REFRESH_KEY,
      { expiresIn: "7d" }
    );

    // Gửi Refresh Token vào Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    const { mat_khau_ma_hoa, ...publicData } = user;

    res.status(200).json({
      ...publicData,
      roles: roleNames,
      accessToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server", detail: err });
  }
});

// 3. REFRESH TOKEN
router.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json("Không có refresh token!");

  jwt.verify(refreshToken, REFRESH_KEY, (err, user) => {
    if (err) return res.status(403).json("Refresh Token lỗi hoặc hết hạn!");

    const newAccess = jwt.sign({ id: user.id, roles: user.roles }, ACCESS_KEY, {
      expiresIn: "15m",
    });

    res.status(200).json({ accessToken: newAccess });
  });
});

// 4. LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });

  res.status(200).json("Đăng xuất thành công!");
});

router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
