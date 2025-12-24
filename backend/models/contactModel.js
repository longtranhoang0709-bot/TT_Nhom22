const db = require("../db");

const Contact = {
  // Thêm tin nhắn mới
  create: async (data) => {
    await db.query(
      "INSERT INTO LIEN_HE (ten_nguoi_gui, email, noi_dung) VALUES (?, ?, ?)",
      [data.name, data.email, data.message]
    );
  },
  // Lấy danh sách tin nhắn
  getAll: async () => {
    const [rows] = await db.query(
      "SELECT * FROM LIEN_HE ORDER BY ngay_gui DESC"
    );
    return rows;
  },
  delete: async (id) => {
    await db.query("DELETE FROM LIEN_HE WHERE ma_lien_he = ?", [id]);
  },
};

module.exports = Contact;
