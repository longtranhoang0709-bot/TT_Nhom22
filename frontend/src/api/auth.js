import api from "./axios";

// 1. REGISTER / ĐĂNG KÝ
export const register = (data) => {
  return api.post("/auth/register", data);
};

// 2. LOGIN / ĐĂNG NHẬP
export const login = (data) => {
  return api.post("/auth/login", data);
};

export const forgotPassword = (email) => {
    return axios.post('/auth/forgot-password', { email });
};

//QUÊN MẬT KHẨU - GỬI TOKEN QUA EMAIL
export const resetPassword = (data) => {
    // data gồm: { token, newPassword }
    return axios.post('/auth/reset-password', data);
};