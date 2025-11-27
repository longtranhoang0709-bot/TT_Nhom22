const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const jwt = require("jsonwebtoken");

const ACCESS_KEY = process.env.ACCESS_KEY || "access_secret_key_123";
const REFRESH_KEY = process.env.REFRESH_KEY || "refresh_secret_key_789";

// === ĐĂNG KÝ ===
exports.register = async (req, res) => {
    const { email, password, ho_ten, so_dien_thoai, dia_chi } = req.body;

    if (!email || !password || !ho_ten)
        return res.status(400).json("Vui lòng nhập đủ thông tin!");

    try {
        const [check] = await db.promise().query(
            "SELECT * FROM NGUOI_DUNG WHERE email = ?",
            [email]
        );

        if (check.length > 0)
            return res.status(409).json("Email đã tồn tại!");

        const hashed = bcrypt.hashSync(password, 10);
        const userId = uuidv4();

        // Insert vào bảng NGUOI_DUNG
        await db.promise().query(
            `INSERT INTO NGUOI_DUNG 
            (ma_nguoi_dung, ho_ten, email, so_dien_thoai, mat_khau_ma_hoa, dia_chi)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, ho_ten, email, so_dien_thoai, hashed, dia_chi]
        );

        // GÁN VAI TRÒ MẶC ĐỊNH: 1 = Khách hàng
        await db.promise().query(
            "INSERT INTO NGUOI_DUNG_VAI_TRO (ma_nguoi_dung, ma_vai_tro) VALUES (?, ?)",
            [userId, 1]
        );

        res.status(200).json("Đăng ký thành công!");
    } catch (err) {
        return res.status(500).json({ error: "Lỗi Server", details: err });
    }
};

// === ĐĂNG NHẬP ===
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

        // Tạo Access Token (15 phút)
        const accessToken = jwt.sign(
            {
                id: user.ma_nguoi_dung,
                role: user.ten_vai_tro,
            },
            ACCESS_KEY,
            { expiresIn: "15m" }
        );

        // Tạo Refresh Token (7 ngày)
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

// === REFRESH TOKEN (Cấp lại access token mới) ===
exports.refresh = async (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) return res.status(401).json("Không có refresh token!");

    jwt.verify(token, REFRESH_KEY, (err, user) => {
        if (err) return res.status(403).json("Refresh token không hợp lệ!");

        const newAccessToken = jwt.sign(
            { id: user.id, role: user.role },
            ACCESS_KEY,
            { expiresIn: "15m" }
        );

        res.json({ accessToken: newAccessToken });
    });
};

// === LOGOUT ===
exports.logout = async (req, res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
    });
    res.status(200).json("Đăng xuất thành công!");
};