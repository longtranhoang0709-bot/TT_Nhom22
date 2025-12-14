const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const jwt = require("jsonwebtoken");

const ACCESS_KEY = process.env.ACCESS_KEY || "access_secret_key_123";
const REFRESH_KEY = process.env.REFRESH_KEY || "refresh_secret_key_789";

// ĐĂNG KÝ
exports.register = async (req, res) => {
  const { email, password, ho_ten, so_dien_thoai, dia_chi } = req.body;

  if (!email || !password || !ho_ten)
    return res.status(400).json("Vui lòng nhập đủ thông tin!");

  try {
    const [check] = await db
      .promise()
      .query("SELECT * FROM NGUOI_DUNG WHERE email = ?", [email]);

    if (check.length > 0) return res.status(409).json("Email đã tồn tại!");

    const hashed = bcrypt.hashSync(password, 10);
    const userId = uuidv4();

    await db.promise().query(
      `INSERT INTO NGUOI_DUNG 
          (ma_nguoi_dung, ho_ten, email, so_dien_thoai, mat_khau_ma_hoa, dia_chi)
          VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, ho_ten, email, so_dien_thoai, hashed, dia_chi]
    );

    await db
      .promise()
      .query(
        "INSERT INTO NGUOI_DUNG_VAI_TRO (ma_nguoi_dung, ma_vai_tro) VALUES (?, ?)",
        [userId, 1]
      );

    res.status(200).json("Đăng ký thành công!");
  } catch (err) {
    return res.status(500).json({ error: "Lỗi Server", details: err });
  }
};

// ĐĂNG NHẬP
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json("Thiếu email hoặc mật khẩu!");

  try {
    const [rows] = await db.promise().query(
      `SELECT NGUOI_DUNG.*, VAI_TRO.ten_vai_tro
          FROM NGUOI_DUNG
          JOIN NGUOI_DUNG_VAI_TRO ON NGUOI_DUNG.ma_nguoi_dung = NGUOI_DUNG_VAI_TRO.ma_nguoi_dung
          JOIN VAI_TRO ON NGUOI_DUNG_VAI_TRO.ma_vai_tro = VAI_TRO.ma_vai_tro
          WHERE email = ? LIMIT 1`,
      [email]
    );

    if (rows.length === 0)
      return res.status(404).json("Tài khoản không tồn tại!");

    const user = rows[0];

    const checkPass = bcrypt.compareSync(password, user.mat_khau_ma_hoa);
    if (!checkPass) return res.status(400).json("Sai mật khẩu!");

    const accessToken = jwt.sign(
      {
        id: user.ma_nguoi_dung,
        role: user.ten_vai_tro,
      },
      ACCESS_KEY,
      { expiresIn: "20m" }
    );

    const refreshToken = jwt.sign(
      {
        id: user.ma_nguoi_dung,
        role: user.ten_vai_tro,
      },
      REFRESH_KEY,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.status(200).json({
      message: "Đăng nhập thành công!",
      accessToken,
      user: {
        id: user.ma_nguoi_dung,
        ho_ten: user.ho_ten,
        email: user.email,
        role: user.ten_vai_tro,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Lỗi login", details: err });
  }
};

//  REFRESH TOKEN (Cấp lại access token mới)
exports.refresh = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) return res.status(401).json("Không có refresh token!");

  jwt.verify(token, REFRESH_KEY, (err, user) => {
    if (err) return res.status(403).json("Refresh token không hợp lệ!");

    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role },
      ACCESS_KEY,
      { expiresIn: "20m" }
    );

    res.json({ accessToken: newAccessToken });
  });
};

// LOGOUT
exports.logout = async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });
  res.status(200).json("Đăng xuất thành công!");
};

// 3. QUÊN MẬT KHẨU (Gửi mail)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // B1: Kiểm tra email có tồn tại không
    const [users] = await db.query("SELECT * FROM NGUOI_DUNG WHERE email = ?", [
      email,
    ]);
    if (users.length === 0)
      return res.status(404).json("Email không tồn tại trong hệ thống!");

    // B2: Tạo token ngẫu nhiên
    const token = crypto.randomBytes(32).toString("hex");

    // B3: Lưu xuống DB (Xóa token cũ nếu có -> Lưu token mới)
    await db.query("DELETE FROM PASSWORD_RESETS WHERE email = ?", [email]);
    await db.query("INSERT INTO PASSWORD_RESETS (email, token) VALUES (?, ?)", [
      email,
      token,
    ]);

    // B4: Cấu hình gửi mail (LƯU Ý: Nên để email/pass trong file .env)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "dohoangphuoc10@gmail.com", // Email của bạn
        pass: "eswa qlpu sbpf gczk", // Mật khẩu ứng dụng của bạn
      },
    });

    // Link reset trỏ về Frontend (Ví dụ: http://localhost:5173/reset-password?token=...)
    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    // Nội dung mail
    const mailOptions = {
      from: '"Coffee Shop" <no-reply@coffeeshop.com>',
      to: email,
      subject: "Đặt lại mật khẩu",
      text: `Click vào link này để đặt lại mật khẩu của bạn: ${resetLink}`,
      html: `<p>Bạn đã yêu cầu đặt lại mật khẩu.</p>
             <p>Click vào link sau để đặt lại (Hết hạn trong 15 phút):</p>
             <a href="${resetLink}">${resetLink}</a>`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json("Đã gửi email hướng dẫn đặt lại mật khẩu!");
  } catch (err) {
    console.error(err);
    res.status(500).json("Lỗi gửi email: " + err.message);
  }
};

// 4. ĐẶT LẠI MẬT KHẨU (Xử lý khi user click link)
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // B1: Tìm token trong DB
    const [rows] = await db.query(
      "SELECT * FROM PASSWORD_RESETS WHERE token = ?",
      [token]
    );
    if (rows.length === 0)
      return res.status(400).json("Token không hợp lệ hoặc đã hết hạn!");

    const resetRequest = rows[0];

    // B2: Kiểm tra thời gian (Sửa lỗi múi giờ bằng cách tính trên DB hoặc chấp nhận độ lệch nhỏ)
    // Cách đơn giản nhất: So sánh thời gian hiện tại vs thời gian tạo + 15 phút
    const now = new Date().getTime();
    const created = new Date(resetRequest.created_at).getTime();
    const diff = now - created;

    // 15 phút = 15 * 60 * 1000 = 900000 ms
    if (diff > 900000 || diff < 0) {
      // diff < 0 là trường hợp giờ server bị lệch, cũng coi như lỗi cho an toàn
      return res.status(400).json("Token đã hết hạn!");
    }

    // B3: Cập nhật mật khẩu mới
    const hashed = bcrypt.hashSync(newPassword, 10);
    await db.query(
      "UPDATE NGUOI_DUNG SET mat_khau_ma_hoa = ? WHERE email = ?",
      [hashed, resetRequest.email]
    );

    // B4: Xóa token đã dùng
    await db.query("DELETE FROM PASSWORD_RESETS WHERE token = ?", [token]);

    res.status(200).json("Đổi mật khẩu thành công! Hãy đăng nhập lại.");
  } catch (err) {
    res.status(500).json("Lỗi đặt lại mật khẩu: " + err.message);
  }
};
