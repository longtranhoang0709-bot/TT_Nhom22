const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.register = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        const hashed = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
            [username, hashed, email]
        );

        res.json({ message: "Đăng ký thành công", userId: result.insertId });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: "Đã xảy ra lỗi" });
    }
};

module.exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const [rows] = await pool.query(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );

        if (rows.length === 0)
            return res.status(400).json({ error: "Sai tài khoản" });

        const user = rows[0];

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(400).json({ error: "Sai mật khẩu" });

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: "1d" }
        );

        res.json({ message: "Đăng nhập thành công", token });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: "Đã xảy ra lỗi" });
    }
};
