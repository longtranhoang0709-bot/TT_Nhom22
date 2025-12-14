const OrderModel = require('../models/orderModel');

// 1. Lấy danh sách đơn hàng của user đang đăng nhập
exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await OrderModel.getByUser(userId);
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ error: "Lỗi Server" });
    }
};

// 2. Admin lấy tất cả đơn hàng
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await OrderModel.getAll();
        res.status(200).json(orders);
    } catch (err) {
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
        res.status(500).json({ error: "Lỗi Server" });
    }
};

// 4. Update trạng thái (Chỉ Admin)
exports.updateOrderStatus = async (req, res) => {
    const { status } = req.body; // 'Confirmed', 'Shipping', ...
    try {
        await OrderModel.updateStatus(req.params.id, status);
        res.status(200).json("Cập nhật trạng thái thành công!");
    } catch (err) {
        res.status(500).json({ error: "Lỗi Server" });
    }
};