const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Khóa bí mật (Ưu tiên lấy từ biến môi trường, nếu không có thì dùng chuỗi cứng)
const ACCESS_KEY = process.env.ACCESS_KEY || "access_secret_key_123";
const REFRESH_KEY = process.env.REFRESH_KEY || "refresh_secret_key_789";

// 1. ĐĂNG KÝ
exports.register = async (req, res) => {
  const { email, password, ho_ten, so_dien_thoai, dia_chi } = req.body;

  if (!email || !password || !ho_ten) {
    return res.status(400).json("Vui lòng nhập đủ email, mật khẩu và họ tên!");
  }

  try {
    // Kiểm tra email tồn tại
    const [exist] = await db
      .promise()
      .query("SELECT * FROM NGUOI_DUNG WHERE email = ?", [email]);
    if (exist.length > 0) return res.status(409).json("Email đã tồn tại!");

    // Mã hóa mật khẩu
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const userId = uuidv4();

    // Lưu User
    await db.promise().query(
      `INSERT INTO NGUOI_DUNG (ma_nguoi_dung, ho_ten, email, so_dien_thoai, mat_khau_ma_hoa, dia_chi)
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

    // Gán quyền mặc định (Customer = 1)
    await db
      .promise()
      .query(
        "INSERT INTO NGUOI_DUNG_VAI_TRO (ma_nguoi_dung, ma_vai_tro) VALUES (?, ?)",
        [userId, 1]
      );

    res.status(201).json("Đăng ký thành công!");
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Lỗi server khi đăng ký", detail: err.message });
  }
};

// 2. ĐĂNG NHẬP
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json("Vui lòng nhập email và mật khẩu!");

  try {
    // Tìm user
    const [rows] = await db
      .promise()
      .query("SELECT * FROM NGUOI_DUNG WHERE email = ?", [email]);
    if (rows.length === 0)
      return res.status(404).json("Tài khoản không tồn tại!");

    const user = rows[0];

    // Check pass
    const match = bcrypt.compareSync(password, user.mat_khau_ma_hoa);
    if (!match) return res.status(400).json("Sai mật khẩu!");

    // Lấy danh sách vai trò
    const [roles] = await db.promise().query(
      `SELECT V.ten_vai_tro 
       FROM NGUOI_DUNG_VAI_TRO NVT
       JOIN VAI_TRO V ON NVT.ma_vai_tro = V.ma_vai_tro
       WHERE NVT.ma_nguoi_dung = ?`,
      [user.ma_nguoi_dung]
    );

    // Chuyển mảng object thành mảng tên quyền
    const roleNames = roles.map((r) => r.ten_vai_tro);

    // Tạo Token
    const accessToken = jwt.sign(
      { id: user.ma_nguoi_dung, roles: roleNames }, // Payload
      ACCESS_KEY,
      { expiresIn: "60m" }
    );

    const refreshToken = jwt.sign(
      { id: user.ma_nguoi_dung, roles: roleNames },
      REFRESH_KEY,
      { expiresIn: "7d" }
    );

    // Lưu Refresh Token vào Cookie (HttpOnly)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    // Trả về thông tin (Loại bỏ mật khẩu)
    const { mat_khau_ma_hoa, ...userInfo } = user;

    res.status(200).json({
      message: "Đăng nhập thành công!",
      user: { ...userInfo, roles: roleNames },
      accessToken,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Lỗi server khi đăng nhập", detail: err.message });
  }
};

// 3. REFRESH TOKEN
exports.refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json("Bạn chưa đăng nhập (Không có Refresh Token)!");

  jwt.verify(refreshToken, REFRESH_KEY, (err, user) => {
    if (err) return res.status(403).json("Token hết hạn hoặc không hợp lệ!");

    // Tạo Access Token mới
    const newAccessToken = jwt.sign(
      { id: user.id, roles: user.roles },
      ACCESS_KEY,
      { expiresIn: "60m" }
    );

    res.status(200).json({ accessToken: newAccessToken });
  });
};

// 4. LOGOUT
exports.logout = async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });
  res.status(200).json("Đăng xuất thành công!");
};

// 5. QUÊN MẬT KHẨU
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const [users] = await db
      .promise()
      .query("SELECT * FROM NGUOI_DUNG WHERE email = ?", [email]);
    if (users.length === 0) return res.status(404).json("Email không tồn tại!");

    const token = crypto.randomBytes(32).toString("hex");

    // Xóa token cũ -> Lưu token mới
    await db
      .promise()
      .query("DELETE FROM PASSWORD_RESETS WHERE email = ?", [email]);
    await db
      .promise()
      .query("INSERT INTO PASSWORD_RESETS (email, token) VALUES (?, ?)", [
        email,
        token,
      ]);

    // Cấu hình gửi mail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "dohoangphuoc10@gmail.com",
        pass: "eswa qlpu sbpf gczk",
      },
    });

    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    await transporter.sendMail({
      from: '"Coffee Shop" <no-reply@coffeeshop.com>',
      to: email,
      subject: "Đặt lại mật khẩu",
      html: `<p>Click vào đây để đổi mật khẩu: <a href="${resetLink}">Tại đây</a></p>`,
    });

    res.status(200).json("Đã gửi email hướng dẫn!");
  } catch (err) {
    console.error(err);
    res.status(500).json("Lỗi gửi email: " + err.message);
  }
};

// 6. ĐẶT LẠI MẬT KHẨU
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const [rows] = await db
      .promise()
      .query("SELECT * FROM PASSWORD_RESETS WHERE token = ?", [token]);
    if (rows.length === 0)
      return res.status(400).json("Token không hợp lệ hoặc hết hạn!");

    // Hash pass mới
    const hashed = bcrypt.hashSync(newPassword, 10);

    // Cập nhật User
    await db
      .promise()
      .query("UPDATE NGUOI_DUNG SET mat_khau_ma_hoa = ? WHERE email = ?", [
        hashed,
        rows[0].email,
      ]);

    // Xóa token
    await db
      .promise()
      .query("DELETE FROM PASSWORD_RESETS WHERE token = ?", [token]);

    res.status(200).json("Đổi mật khẩu thành công!");
  } catch (err) {
    res.status(500).json("Lỗi đặt lại mật khẩu: " + err.message);
  }
};
