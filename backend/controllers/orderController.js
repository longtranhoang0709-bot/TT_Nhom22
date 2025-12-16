const OrderModel = require('../models/orderModel');

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
        
        // Kiểm tra quyền: Chỉ chủ đơn hàng hoặc Admin mới được xem
        if (req.user.role !== 'Admin' && order.ma_nguoi_dung !== req.user.id) {
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
        const db = require('../db'); 

        // Tính TỔNG doanh thu (Chỉ tính đơn đã hoàn thành)
        const [revenueRes] = await db.query(`
            SELECT SUM(tong_tien) as revenue 
            FROM DON_HANG 
            WHERE trang_thai = 'Completed' 
        `);

        // Đếm đơn hàng đang chờ xử lý
        const [pendingRes] = await db.query(`
            SELECT COUNT(*) as count FROM DON_HANG WHERE trang_thai = 'Pending'
        `);

        // Đếm TỔNG số đơn đã hoàn thành
        const [completedRes] = await db.query(`
            SELECT COUNT(*) as count FROM DON_HANG WHERE trang_thai = 'Completed'
        `);

        //lấy danh sách sản phẩm sắp hết (dưới 5 cái)
        const [lowStockItems] = await db.query(`
            SELECT SP.ten_san_pham, K.so_luong
            FROM KHO K
            JOIN SAN_PHAM SP ON K.ma_san_pham = SP.ma_san_pham
            WHERE K.so_luong < 5
        `);
        
       //lấy 5 đơn hàng mới nhất
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
            
            recentOrders
        });

    } catch (err) {
        console.error("Lỗi getStats:", err); 
        res.status(500).json({ error: "Lỗi lấy thống kê" });
    }
};