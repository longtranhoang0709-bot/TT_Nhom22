import api from "./axios";

// 1. Lấy danh sách đơn hàng của người dùng đang đăng nhập
export const getMyOrders = () => {
  return api.get("/orders/my");
};

// 2. Lấy chi tiết một đơn hàng cụ thể
export const getOrderDetail = (id) => {
  return api.get(`/orders/${id}`);
};

// 3. Lấy tất cả đơn hàng (Admin)
export const getAllOrders = () => {
  return api.get("/orders");
};

// 4. Cập nhật trạng thái đơn hàng (Admin)
export const updateOrderStatus = (id, status) => {
  return api.put(`/orders/${id}/status`, { status });
};

// 5. Lấy thống kê doanh thu (Admin Dashboard)
export const getOrderStats = () => {
  return api.get("/orders/stats");
};
// 6. Hủy đơn hàng (Người dùng)
export const cancelOrder = (id) => {
  return api.put(`/orders/${id}/cancel`);
};
// 7. Hủy đơn hàng (Admin)
export const adminCancelOrder = (id) => {
  return api.put(`/orders/${id}/admin-cancel`);
};