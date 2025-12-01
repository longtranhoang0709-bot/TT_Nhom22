const UserModel = require("../models/userModel");
const db = require("../db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

// Lấy danh sách users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.getAll();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Lỗi Server" });
  }
};

// Lấy chi tiết user
exports.getUserById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user)
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    const { mat_khau_ma_hoa, ...info } = user;
    res.status(200).json(info);
  } catch (err) {
    res.status(500).json({ error: "Lỗi Server" });
  }
};

// Admin tạo user thủ công
exports.createUser = async (req, res) => {
  const { ho_ten, email, so_dien_thoai, mat_khau_ma_hoa, dia_chi } = req.body;

  if (!ho_ten || !email || !mat_khau_ma_hoa)
    return res.status(400).json({ error: "Thiếu trường bắt buộc" });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const exist = await UserModel.findByEmail(email);
    if (exist) {
      await conn.rollback();
      return res.status(400).json({ error: "Email đã tồn tại" });
    }

    const userId = uuidv4(); 
    await UserModel.create(conn, {
      ma_nguoi_dung: userId,
      ho_ten,
      email,
      so_dien_thoai,
      mat_khau_ma_hoa,
      dia_chi,
    });

    await UserModel.assignRole(conn, userId, 1);

    await conn.commit();
    res.status(201).json({ message: "Tạo người dùng thành công", userId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Lỗi Server" });
  } finally {
    conn.release();
  }
};

// Cập nhật user
exports.updateUser = async (req, res) => {
  try {
    await UserModel.update(req.params.id, req.body); // Lấy lại thông tin mới nhất để trả về
    const updatedUser = await UserModel.findById(req.params.id);
    const { mat_khau_ma_hoa, ...info } = updatedUser;
    res.status(200).json(info);
  } catch (err) {
    res.status(500).json({ error: "Lỗi Server" });
  }
};

// Xóa user
exports.deleteUser = async (req, res) => {
  try {
    await UserModel.delete(req.params.id);
    res.status(200).json({ message: "Đã xóa thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi Server" });
  }
};
