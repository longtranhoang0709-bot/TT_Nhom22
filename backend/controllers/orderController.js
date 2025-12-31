const db = require("../db");
const OrderModel = require("../models/orderModel");

// 1. Lấy danh sách đơn hàng của user đang đăng nhập
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await OrderModel.getByUser(userId);
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi Server" });
  }
};

// 2. Admin lấy tất cả đơn hàng
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.getAll();
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi Server" });
  }
};

// 3. Lấy chi tiết đơn hàng
exports.getOrderDetail = async (req, res) => {
  try {
    const order = await OrderModel.getDetail(req.params.id);
    if (!order) return res.status(404).json("Không tìm thấy đơn hàng");
    //-------------------------------
    const userRoles = req.user.roles || [];
    const isAdmin = userRoles.includes("Admin");

    // Kiểm tra quyền: Chỉ chủ đơn hàng hoặc Admin mới được xem
    if (!isAdmin && order.ma_nguoi_dung !== req.user.id) {
      return res.status(403).json("Không có quyền truy cập đơn hàng này");
    }
    res.status(200).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi Server" });
  }
};

// 4. Update trạng thái (Chỉ Admin)
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  try {
    await OrderModel.updateStatus(req.params.id, status);
    res.status(200).json("Cập nhật trạng thái thành công!");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi Server" });
  }
};

// 5. Lấy thống kê cho dashboard admin
exports.getStats = async (req, res) => {
  try {
    const [revenueRes] = await db.query(
      `SELECT SUM(tong_tien) as revenue FROM DON_HANG WHERE trang_thai = 'Completed'`
    );
    const [pendingRes] = await db.query(
      `SELECT COUNT(*) as count FROM DON_HANG WHERE trang_thai = 'Pending'`
    );
    const [completedRes] = await db.query(
      `SELECT COUNT(*) as count FROM DON_HANG WHERE trang_thai = 'Completed'`
    );
    const [lowStockItems] = await db.query(`
            SELECT NL.ten_nguyen_lieu as ten_san_pham, K.so_luong
            FROM KHO K
            JOIN NGUYEN_LIEU NL ON K.ma_nguyen_lieu = NL.ma_nguyen_lieu
            WHERE K.so_luong < K.dinh_muc_toi_thieu
        `);

    const [recentOrders] = await db.query(`
            SELECT DH.*, ND.ho_ten 
            FROM DON_HANG DH
            JOIN NGUOI_DUNG ND ON DH.ma_nguoi_dung = ND.ma_nguoi_dung
            ORDER BY DH.ngay_tao DESC LIMIT 5
        `);

    res.status(200).json({
      revenueToday: revenueRes[0].revenue || 0,
      pendingOrders: pendingRes[0].count || 0,
      completedToday: completedRes[0].count || 0,
      lowStock: lowStockItems.length,
      lowStockList: lowStockItems,
      recentOrders,
    });
  } catch (err) {
    console.error("Lỗi getStats:", err);
    res.status(500).json({ error: "Lỗi lấy thống kê" });
  }
};

// Khách hàng tự hủy đơn
exports.cancelOrder = async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Kiểm tra đơn hàng
    const [orders] = await conn.query(
      "SELECT * FROM DON_HANG WHERE ma_don_hang = ? AND ma_nguoi_dung = ?",
      [orderId, userId]
    );

    if (orders.length === 0) {
      await conn.rollback();
      return res.status(404).json("Không tìm thấy đơn hàng!");
    }

    const order = orders[0];
    if (order.trang_thai !== "Pending") {
      await conn.rollback();
      return res.status(400).json("Không thể hủy đơn hàng đã được xác nhận!");
    }

    // 2. Cập nhật trạng thái
    await conn.query(
      "UPDATE DON_HANG SET trang_thai = 'Cancelled' WHERE ma_don_hang = ?",
      [orderId]
    );

    // 3. Hoàn lại số lượng tồn kho NGUYÊN LIỆU
    // Lấy danh sách sản phẩm trong đơn
    const [items] = await conn.query(
      "SELECT * FROM CHI_TIET_DON_HANG WHERE ma_don_hang = ?",
      [orderId]
    );

    for (const item of items) {
      // Với mỗi sản phẩm, tìm công thức của nó
      const [recipes] = await conn.query(
        "SELECT ma_nguyen_lieu, so_luong_can FROM CONG_THUC WHERE ma_san_pham = ?",
        [item.ma_san_pham]
      );

      // Cộng lại nguyên liệu vào kho
      for (const recipe of recipes) {
        const totalRestock = recipe.so_luong_can * item.so_luong; // Định lượng * số ly
        await conn.query(
          "UPDATE KHO SET so_luong = so_luong + ? WHERE ma_nguyen_lieu = ?",
          [totalRestock, recipe.ma_nguyen_lieu]
        );
      }
    }

    await conn.commit();
    res.status(200).json("Đã hủy đơn hàng thành công!");
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json("Lỗi server");
  } finally {
    conn.release();
  }
};
// Admin hủy đơn
exports.adminCancelOrder = async (req, res) => {
  const orderId = req.params.id;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Lấy thông tin đơn
    const [orders] = await conn.query(
      "SELECT * FROM DON_HANG WHERE ma_don_hang = ?",
      [orderId]
    );
    if (orders.length === 0) {
      await conn.rollback();
      return res.status(404).json("Không tìm thấy đơn hàng!");
    }
    const order = orders[0];

    // Chỉ cho phép hủy nếu chưa Hoàn thành hoặc chưa Hủy trước đó
    if (order.trang_thai === "Completed" || order.trang_thai === "Cancelled") {
      await conn.rollback();
      return res
        .status(400)
        .json("Không thể hủy đơn đã hoàn thành hoặc đã hủy!");
    }

    // 2. Cập nhật trạng thái sang Cancelled
    await conn.query(
      "UPDATE DON_HANG SET trang_thai = 'Cancelled' WHERE ma_don_hang = ?",
      [orderId]
    );

    // 3. Hoàn nguyên liệu vào kho
    const [items] = await conn.query(
      "SELECT * FROM CHI_TIET_DON_HANG WHERE ma_don_hang = ?",
      [orderId]
    );

    for (const item of items) {
      const [recipes] = await conn.query(
        "SELECT ma_nguyen_lieu, so_luong_can FROM CONG_THUC WHERE ma_san_pham = ?",
        [item.ma_san_pham]
      );
      for (const recipe of recipes) {
        const totalRestock = recipe.so_luong_can * item.so_luong;
        await conn.query(
          "UPDATE KHO SET so_luong = so_luong + ? WHERE ma_nguyen_lieu = ?",
          [totalRestock, recipe.ma_nguyen_lieu]
        );
      }
    }

    await conn.commit();
    res.status(200).json("Admin đã hủy đơn và hoàn kho thành công!");
  } catch (err) {
    await conn.rollback();
    res.status(500).json("Lỗi server: " + err.message);
  } finally {
    conn.release();
  }
};
