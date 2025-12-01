import api from "./axios";

// 1. REGISTER / ĐĂNG KÝ
export const register = (data) => {
  return api.post("/auth/register", data);
};

// 2. LOGIN / ĐĂNG NHẬP
export const login = (data) => {
  return api.post("/auth/login", data);
};
