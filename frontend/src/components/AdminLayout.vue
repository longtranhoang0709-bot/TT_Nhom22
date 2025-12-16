<script setup>
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';

const router = useRouter();
const route = useRoute();

const handleLogout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  router.push("/login");
};


const menuItems = [
  { name: 'Tổng Quan', path: '/admin/dashboard', icon: 'bi-grid-fill' },
  { name: 'Quản Lý Thực Đơn', path: '/admin/products', icon: 'bi-cup-hot-fill' },
  { name: 'Khách Hàng', path: '/admin/users', icon: 'bi-people-fill' },
  { name: 'Đơn Hàng', path: '/admin/orders', icon: 'bi-bag-check-fill' },
];

const currentRouteName = computed(() => route.name);
</script>

<template>
  <div class="admin-wrapper">
    <aside class="sidebar">
      <div class="brand">
        <div class="logo-icon">☕</div>
        <div class="brand-text">
          <h3>Cà Phê PL</h3>
          <small>Trang Quản Trị</small>
        </div>
      </div>

      <nav class="menu">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path" 
          :to="item.path"
          class="menu-item"
          active-class="active"
        >
          <i :class="['bi', item.icon, 'me-2']"></i>
          {{ item.name }}
        </router-link>
      </nav>

      <div class="logout-section">
        <button @click="handleLogout" class="btn-logout">
          <i class="bi bi-box-arrow-right me-2"></i> Đăng Xuất
        </button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-header">
        <div>
          <h4 class="mb-0 fw-bold">{{ route.meta.title || 'Quản Trị' }}</h4>
          <small class="text-muted">{{ new Date().toDateString() }}</small>
        </div>
        <div class="admin-profile">
          <div class="text-end me-3">
            <div class="fw-bold">Quản Trị Viên</div>
            <small class="text-muted">admin@caphepl.com</small>
          </div>
          <div class="avatar">A</div>
        </div>
      </header>

      <div class="content-body">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<style scoped>

:root {
  --coffee-dark: #4E342E;
  --coffee-light: #5D4037;
  --bg-light: #F8F9FA;
  --accent: #D7CCC8;
}

.admin-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: #F5F7FA;
}

/* Sidebar Styling */
.sidebar {
  width: 260px;
  background-color: #4E342E; 
  color: #fff;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 1000;
}

.brand {
  padding: 2rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo-icon {
  font-size: 2rem;
  background: #fff;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4E342E;
}

.menu {
  padding: 1.5rem 0;
  flex-grow: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: #D7CCC8;
  text-decoration: none;
  transition: all 0.3s;
  font-weight: 500;
}

.menu-item:hover, .menu-item.active {
  background-color: rgba(255,255,255,0.1);
  color: #fff;
  border-left: 4px solid #A1887F;
}

.logout-section {
  padding: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.btn-logout {
  width: 100%;
  padding: 10px;
  background: rgba(255,255,255,0.1);
  border: none;
  color: #fff;
  border-radius: 6px;
  transition: 0.3s;
}

.btn-logout:hover {
  background: #FF5252;
}

/* Main Content Styling */
.main-content {
  margin-left: 260px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.top-header {
  background: #fff;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.avatar {
  width: 45px;
  height: 45px;
  background-color: #4E342E;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.admin-profile {
  display: flex;
  align-items: center;
}

.content-body {
  padding: 2rem;
}
</style>