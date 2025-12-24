const db = require("../db");

const Review = {
  // Lấy 3 đánh giá cao nhất (5 sao) mới nhất cho trang chủ
  getTop3: async () => {
    const [rows] = await db.query(`
      SELECT PH.*, ND.ho_ten 
      FROM PHAN_HOI PH 
      JOIN NGUOI_DUNG ND ON PH.ma_nguoi_dung = ND.ma_nguoi_dung 
      WHERE PH.danh_gia >= 4
      ORDER BY PH.danh_gia DESC, PH.ngay_gui DESC 
      LIMIT 3
    `);
    return rows;
  },

  // Lấy tất cả đánh giá
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT PH.*, ND.ho_ten 
      FROM PHAN_HOI PH 
      JOIN NGUOI_DUNG ND ON PH.ma_nguoi_dung = ND.ma_nguoi_dung 
      ORDER BY PH.ngay_gui DESC
    `);
    return rows;
  },

  // Gửi đánh giá mới
  create: async (userId, rating, content) => {
    await db.query(
      "INSERT INTO PHAN_HOI (ma_nguoi_dung, danh_gia, noi_dung) VALUES (?, ?, ?)",
      [userId, rating, content]
    );
  },
};

module.exports = Review;
