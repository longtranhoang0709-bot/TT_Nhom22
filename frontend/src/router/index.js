import { createRouter, createWebHistory } from "vue-router";

import ProductManager from "../views/ProductManager.vue";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Profile from "../views/Profile.vue";
import UserList from "../views/UserList.vue";
import ForgotPassword from "../views/ForgotPassword.vue";
import ResetPassword from "../views/ResetPassword.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/register",
      name: "register",
      component: Register,
    },
    {
      path: "/profile",
      name: "profile",
      component: Profile,
    },

    {
      path: "/admin/users",
      name: "user-list",
      component: UserList,
      meta: { requiresAdmin: true },
    },
    {
      path: "/admin/products",
      component: ProductManager,
      meta: { requiresAdmin: true },
    },
    { path: "/forgot-password", component: ForgotPassword },
    { path: "/reset-password", component: ResetPassword },
  ],
});

router.beforeEach((to, from, next) => {
  // 1. Lấy thông tin user từ localStorage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // 2. Kiểm tra nếu route yêu cầu Admin (meta.requiresAdmin = true)
  if (to.meta.requiresAdmin) {
    // Nếu chưa đăng nhập -> Đá về trang login
    if (!user) {
      alert("Vui lòng đăng nhập để truy cập!");
      return next("/login");
    }

    // Nếu đã đăng nhập nhưng KHÔNG CÓ quyền Admin

    if (!user.roles || !user.roles.includes("Admin")) {
      alert("Bạn không có quyền truy cập trang này!");
      return next("/"); // Đá về trang chủ
    }
  }

  // Nếu hợp lệ thì cho đi tiếp
  next();
});

export default router;
