const db = require("../db");

const Promotion = {
  // 1. Lấy tất cả mã (Cho Admin)
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM KHUYEN_MAI");
    return rows;
  },

  // 2. Tìm mã theo Code (Dùng để check trùng hoặc khách nhập mã)
  findByCode: async (code) => {
    const [rows] = await db.query(
      "SELECT * FROM KHUYEN_MAI WHERE ma_code = ?",
      [code]
    );
    // Trả về phần tử đầu tiên nếu tìm thấy, ngược lại trả về undefined
    return rows[0];
  },

  // 3. Tạo mã mới
  create: async (data) => {
    // data là object chứa thông tin cần lưu
    const { code, description, discount, start, end, minOrder } = data;

    const [result] = await db.query(
      "INSERT INTO KHUYEN_MAI (ma_code, mo_ta, giam_phan_tram, ngay_bat_dau, ngay_ket_thuc, don_toi_thieu) VALUES (?, ?, ?, ?, ?, ?)",
      [code, description, discount, start, end, minOrder]
    );
    return result;
  },
  // 4. Cập nhật mã
  update: async (id, data) => {
    const { code, description, discount, start, end, minOrder } = data;
    await db.query(
      "UPDATE KHUYEN_MAI SET ma_code=?, mo_ta=?, giam_phan_tram=?, ngay_bat_dau=?, ngay_ket_thuc=?, don_toi_thieu=? WHERE ma_khuyen_mai=?",
      [code, description, discount, start, end, minOrder, id]
    );
  },
  // 5. Xóa mã
  delete: async (id) => {
    await db.query("DELETE FROM KHUYEN_MAI WHERE ma_khuyen_mai = ?", [id]);
  },
};

module.exports = Promotion;
