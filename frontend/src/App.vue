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
    <BNavbar toggleable="lg" variant="dark" v-b-color-mode="'dark'">
      <BNavbarBrand to="/">Cà Phê PL</BNavbarBrand>
      
      <BNavbarToggle target="nav-collapse" />

      <BCollapse id="nav-collapse" is-nav>
        <BNavbarNav class="ms-auto mb-2 mb-lg-0">
          
          <template v-if="!currentUser">
            <BNavItem to="/login">Đăng nhập</BNavItem>
            <BNavItem to="/register">Đăng ký</BNavItem>
          </template>

          <BNavItemDropdown v-else right>
            <template #button-content>
              Xin chào, <b>{{ currentUser.ho_ten }}</b>
            </template>
            
            <BDropdownItem to="/profile">Hồ sơ cá nhân</BDropdownItem>
            
            <template v-if="currentUser.roles?.includes('Admin')">
              <BDropdownDivider />
              <BDropdownItem to="/admin/products">Quản lý Sản phẩm</BDropdownItem>
              <BDropdownItem to="/admin/users">Quản lý Khách hàng</BDropdownItem>
            </template>
            
            <BDropdownDivider />
            <BDropdownItem @click="handleLogout" variant="danger">Đăng xuất</BDropdownItem>
          </BNavItemDropdown>

        </BNavbarNav>
      </BCollapse>
    </BNavbar>

    <router-view />
  </div>
</template>

<style>
body {
  background-color: #f8f9fa; 
}
</style>