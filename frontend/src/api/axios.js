import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // backend đang chạy ở đây
  withCredentials: false,
});

export default api;
