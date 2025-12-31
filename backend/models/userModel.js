const db = require("../db");

const UserModel = {
  getAll: async () => {
    const [rows] = await db.query(`
            SELECT ND.ma_nguoi_dung, ND.ho_ten, ND.email, ND.so_dien_thoai, ND.dia_chi, ND.ngay_tao, VT.ten_vai_tro
            FROM NGUOI_DUNG ND
            LEFT JOIN NGUOI_DUNG_VAI_TRO NDVT ON ND.ma_nguoi_dung = NDVT.ma_nguoi_dung
            LEFT JOIN VAI_TRO VT ON NDVT.ma_vai_tro = VT.ma_vai_tro
        `);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query(
      `
             SELECT ND.*, VT.ten_vai_tro 
             FROM NGUOI_DUNG ND
             LEFT JOIN NGUOI_DUNG_VAI_TRO NDVT ON ND.ma_nguoi_dung = NDVT.ma_nguoi_dung
             LEFT JOIN VAI_TRO VT ON NDVT.ma_vai_tro = VT.ma_vai_tro
             WHERE ND.ma_nguoi_dung = ?
        `,
      [id]
    );
    return rows[0];
  },

  findByEmail: async (email) => {
    const [rows] = await db.query("SELECT * FROM NGUOI_DUNG WHERE email = ?", [
      email,
    ]);
    return rows[0];
  },

  create: async (conn, data) => {
    const [result] = await conn.query(
      `
            INSERT INTO NGUOI_DUNG (ma_nguoi_dung, ho_ten, email, so_dien_thoai, mat_khau_ma_hoa, dia_chi)
            VALUES (?, ?, ?, ?, ?, ?)
        `,
      [
        data.ma_nguoi_dung,
        data.ho_ten,
        data.email,
        data.so_dien_thoai,
        data.mat_khau_ma_hoa,
        data.dia_chi,
      ]
    );
    return result;
  },

  assignRole: async (conn, userId, roleId) => {
    await conn.query(
      "INSERT INTO NGUOI_DUNG_VAI_TRO (ma_nguoi_dung, ma_vai_tro) VALUES (?, ?)",
      [userId, roleId]
    );
  },

  //  Cập nhật thông tin cơ bản
  updateInfo: async (id, data) => {
    await db.query(
      `
            UPDATE NGUOI_DUNG 
            SET ho_ten = ?, so_dien_thoai = ?, dia_chi = ?
            WHERE ma_nguoi_dung = ?
        `,
      [data.ho_ten, data.so_dien_thoai, data.dia_chi, id]
    );
  },

  //  Cập nhật mật khẩu
  updatePassword: async (id, hashedPassword) => {
    await db.query(
      `
            UPDATE NGUOI_DUNG SET mat_khau_ma_hoa = ? WHERE ma_nguoi_dung = ?
        `,
      [hashedPassword, id]
    );
  },

  //  Cập nhật vai trò
  updateRole: async (userId, roleName) => {
    let roleId = null;
    if (roleName === "User" || roleName === "Khách hàng") {
      roleId = 1;
    } else if (roleName === "Admin" || roleName === "Quản trị") {
      roleId = 3;
    }
    // Thực hiện update
    if (roleId) {
      // Xóa role cũ
      await db.query("DELETE FROM NGUOI_DUNG_VAI_TRO WHERE ma_nguoi_dung = ?", [
        userId,
      ]);
      // Thêm role mới
      await db.query(
        "INSERT INTO NGUOI_DUNG_VAI_TRO (ma_nguoi_dung, ma_vai_tro) VALUES (?, ?)",
        [userId, roleId]
      );
    }
  },

  delete: async (id) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        "DELETE FROM NGUOI_DUNG_VAI_TRO WHERE ma_nguoi_dung = ?",
        [id]
      );
      await conn.query("DELETE FROM NGUOI_DUNG WHERE ma_nguoi_dung = ?", [id]);
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};

module.exports = UserModel;
