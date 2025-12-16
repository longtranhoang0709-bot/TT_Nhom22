import { createRouter, createWebHistory } from "vue-router";
import AdminLayout from "../components/AdminLayout.vue";

import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Profile from "../views/Profile.vue";
import Cart from "../views/Cart.vue";

import Dashboard from "../views/Admin/Dashboard.vue";
import OrderManager from "../views/Admin/OrderManger.vue";
import UserList from "../views/Admin/UserList.vue";
import ProductManager from "../views/Admin/ProductManager.vue";
import Menu from "../views/Menu.vue";
import MyOrders from "../views/MyOrders.vue";

import ForgotPassword from "../views/ForgotPassword.vue";
import ResetPassword from "../views/ResetPassword.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // user routes
    {
      path: "/",
      name: "home",
      component: Home, 
    },
    {
      path: "/menu",
      name: "menu",
      component: Menu, 
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
      path: "/cart",
      name: "cart",
      component: Cart,
      meta: { requiresAuth: true } 
    },

    {
      path: "/my-orders",
      name: "my-orders",
      component: MyOrders,
      meta: { requiresAuth: true } 
    },

    { path: "/forgot-password", component: ForgotPassword },
    { path: "/reset-password", component: ResetPassword },

    //admin routes
    {
      path: "/admin",
      component: AdminLayout, 
      meta: { requiresAdmin: true },
      children: [
        {
          path: "", 
          redirect: "/admin/dashboard"
        },
        { 
          path: "dashboard", 
          name: "admin-dashboard", 
          component: Dashboard,
          meta: { title: "Tổng Quan" }
        },
        { 
          path: "products", 
          name: "admin-products", 
          component: ProductManager,
          meta: { title: "Quản Lý Thực Đơn" }
        },
        { 
          path: "orders", 
          name: "admin-orders", 
          component: OrderManager,
          meta: { title: "Quản Lý Đơn Hàng" }
        },
        { 
          path: "users", 
          name: "admin-users", 
          component: UserList,
          meta: { title: "Quản Lý Khách Hàng" }
        },
      ]
    },
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
