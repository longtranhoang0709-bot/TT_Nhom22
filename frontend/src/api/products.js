import api from "./axios";

// Lấy danh sách (có lọc)
export const getAllProducts = (params) => {
  return api.get("/products", { params });
};

// Tạo sản phẩm (FormData)
export const createProduct = (formData) => {
  return api.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Cập nhật sản phẩm
export const updateProduct = (id, formData) => {
  return api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Xóa sản phẩm
export const deleteProduct = (id) => {
  return api.delete(`/products/${id}`);
};
// Lấy chi tiết sản phẩm
export const getProductById = (id) => api.get(`/products/${id}`);
