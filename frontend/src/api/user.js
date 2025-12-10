
import api from "./axios"; 

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
  // 5. Tạo user mới (Dành cho Admin)
  create(data) {
    return api.post("/users", data); 
  },
};
