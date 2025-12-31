import api from "./axios";

// 1. REGISTER / ĐĂNG KÝ
export const register = (data) => {
  return api.post("/auth/register", data);
};

// 2. LOGIN / ĐĂNG NHẬP
export const login = (data) => {
  return api.post("/auth/login", data);
};
//quen mat khau
export const forgotPassword = (email) => {
    return api.post('/auth/forgot-password', { email });
};

//dat lai mat khau
export const resetPassword = (data) => {
    // data gồm: { token, newPassword }
    return api.post('/auth/reset-password', data);
};