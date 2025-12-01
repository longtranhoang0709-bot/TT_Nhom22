<script setup>
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

// Quản lý trạng thái đăng nhập
const router = useRouter();
const route = useRoute();
const currentUser = ref(null);

// Kiểm tra trạng thái đăng nhập
const checkLogin = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    currentUser.value = JSON.parse(userStr);
  } else {
    currentUser.value = null;
  }
};

// Xử lý đăng xuất
const handleLogout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  currentUser.value = null;
  alert("Đã đăng xuất!");
  router.push("/login");
};

// Theo dõi thay đổi route để cập nhật trạng thái đăng nhập
watch(route, () => {
  checkLogin();
});

// Kiểm tra lần đầu khi load app
checkLogin();
</script>

<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-left">
        <router-link to="/" class="logo">☕ Cà Phê PL</router-link>
      </div>

      <div class="nav-right">
        <div v-if="!currentUser">
          <router-link to="/login" class="nav-link">Đăng nhập</router-link>
          <router-link to="/register" class="nav-link btn-register"
            >Đăng ký</router-link
          >
        </div>

        <div v-else>
          <span class="user-name"
            >Chào, <b>{{ currentUser.ho_ten }}</b></span
          >

          <router-link to="/profile" class="nav-link">Cá nhân</router-link>

          <span
            class="admin-group"
            v-if="
              currentUser &&
              currentUser.roles &&
              currentUser.roles.includes('Admin')
            "
          >
            <router-link to="/admin/users" class="nav-link admin-link"
              >Khách hàng</router-link
            >
            <router-link to="/admin/products" class="nav-link admin-link"
              >Sản Phẩm</router-link
            >
          </span>

          <button @click="handleLogout" class="btn-logout">Đăng xuất</button>
        </div>
      </div>
    </nav>

    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
}
.navbar {
  background-color: #333;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}
.logo {
  color: #fff;
  font-weight: bold;
  font-size: 1.2rem;
  text-decoration: none;
}
.nav-link {
  color: #ddd;
  text-decoration: none;
  margin-left: 15px;
}
.nav-link:hover {
  color: white;
}
.btn-register {
  background-color: #4caf50;
  padding: 5px 10px;
  border-radius: 4px;
  color: white;
}
.btn-logout {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 5px 10px;
  margin-left: 15px;
  cursor: pointer;
  border-radius: 4px;
}
.admin-group {
  border-left: 1px solid #555;
  padding-left: 10px;
  margin-left: 10px;
}
.admin-link {
  color: #ff9800;
  font-weight: bold;
}
.content {
  padding: 20px;
}
</style>
