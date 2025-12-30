import api from "./axios";
// Admin lấy danh sách
export const getAllPromotions = () => api.get("/promotions");
// Admin tạo mã
export const createPromotion = (data) => api.post("/promotions", data);
// Khách hàng kiểm tra mã 
export const checkCoupon = (code, totalOrderValue) => 
  api.post("/promotions/check", { code, totalOrderValue });
// Admin xóa mã
export const deletePromotion = (id) => api.delete(`/promotions/${id}`);
// Admin cập nhật mã
export const updatePromotion = (id, data) => api.put(`/promotions/${id}`, data);