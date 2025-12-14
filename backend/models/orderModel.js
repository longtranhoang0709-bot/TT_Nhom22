const db = require("../db");

const OrderModel = {
  // Lấy đơn hàng của 1 user
  getByUser: async (userId) => {
    const [rows] = await db.query(
      "SELECT * FROM DON_HANG WHERE ma_nguoi_dung = ? ORDER BY ngay_tao DESC",
      [userId]
    );
    return rows;
  },

  // Admin lấy toàn bộ đơn hàng
  getAll: async () => {
    const [rows] = await db.query(`
            SELECT DH.*, ND.ho_ten, ND.email 
            FROM DON_HANG DH
            JOIN NGUOI_DUNG ND ON DH.ma_nguoi_dung = ND.ma_nguoi_dung
            ORDER BY DH.ngay_tao DESC
        `);
    return rows;
  },

  // Lấy chi tiết đơn hàng (kèm sản phẩm)
  getDetail: async (orderId) => {
    // Lấy thông tin chung
    const [order] = await db.query(
      "SELECT * FROM DON_HANG WHERE ma_don_hang = ?",
      [orderId]
    );
    if (order.length === 0) return null;

    // Lấy list sản phẩm
    const [items] = await db.query(
      `
            SELECT CT.*, SP.ten_san_pham, HA.duong_dan_anh
            FROM CHI_TIET_DON_HANG CT
            JOIN SAN_PHAM SP ON CT.ma_san_pham = SP.ma_san_pham
            LEFT JOIN HINH_ANH_SAN_PHAM HA ON SP.ma_san_pham = HA.ma_san_pham AND HA.anh_chinh = 1
            WHERE CT.ma_don_hang = ?
        `,
      [orderId]
    );

    return { ...order[0], items };
  },

  // Update trạng thái đơn hàng
  updateStatus: async (orderId, status) => {
    await db.query("UPDATE DON_HANG SET trang_thai = ? WHERE ma_don_hang = ?", [
      status,
      orderId,
    ]);
  },
};

module.exports = OrderModel;
