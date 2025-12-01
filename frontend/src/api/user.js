// File: src/api/user.js
import api from "./axios"; // Gọi file cấu hình axios (nằm cùng thư mục api)

export default {
  // 1. Lấy danh sách tất cả user (Dành cho Admin)
  getAll() {
    return api.get("/users");
  },

  // 2. Lấy thông tin chi tiết 1 user (Dùng cho trang Cá nhân)
  getById(id) {
    return api.get(`/users/${id}`);
  },

  // 3. Cập nhật thông tin user 
  update(id, data) {
    return api.put(`/users/${id}`, data);
  },

  // 4. Xóa user (Dành cho Admin)
  delete(id) {
    return api.delete(`/users/${id}`);
  },
};
