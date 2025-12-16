import api from "./axios";

// Lấy thông tin giỏ hàng
export const getCart = () => {
  return api.get("/cart");
};

// Thêm sản phẩm vào giỏ
export const addToCart = (productId, quantity = 1) => {
  return api.post("/cart/add", { productId, quantity });
};

// Cập nhật số lượng
export const updateCartItem = (productId, quantity) => {
  return api.put("/cart/update", { productId, quantity });
};

// Xóa sản phẩm khỏi giỏ
export const removeCartItem = (productId) => {
  return api.delete(`/cart/remove/${productId}`);
};

// Thanh toán (Checkout)
export const checkout = (data) => {
  // data = { address, phone, note }
  return api.post("/cart/checkout", data);
};