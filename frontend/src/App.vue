<script setup>
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

// Quản lý trạng thái
const router = useRouter();
const route = useRoute();
const currentUser = ref(null);
const showSearchBar = ref(false);
const searchQuery = ref("");

// Logic thanh tìm kiếm
const toggleSearch = () => {
  showSearchBar.value = !showSearchBar.value;
  if (showSearchBar.value) {
    setTimeout(
      () => document.getElementById("header-search-input")?.focus(),
      100
    );
  }
};

const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: "/menu", query: { q: searchQuery.value } });
    showSearchBar.value = false;
    searchQuery.value = "";
  }
};

// Kiểm tra đăng nhập
const checkLogin = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    currentUser.value = JSON.parse(userStr);
  } else {
    currentUser.value = null;
  }
};

// Đăng xuất
const handleLogout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  currentUser.value = null;
  alert("Đã đăng xuất!");
  router.push("/login");
};

watch(route, () => {
  checkLogin();
});
checkLogin();
</script>

<template>
  <div id="app">
    <BNavbar toggleable="lg" class="custom-navbar" sticky="top">
      <BContainer class="d-flex align-items-center h-100 position-relative">
        <BNavbarBrand
          to="/"
          class="d-flex align-items-center gap-2 fw-bold text-uppercase brand-logo p-0"
        >
          <div class="nav-logo-icon"><i class="bi bi-cup-hot-fill"></i></div>
          CÀ PHÊ PL
        </BNavbarBrand>

        <BNavbarToggle target="nav-collapse" class="border-0">
          <i class="bi bi-list text-white fs-2"></i>
        </BNavbarToggle>

        <BCollapse id="nav-collapse" is-nav>
          <BNavbarNav
            class="mx-auto text-uppercase fw-bold main-menu align-items-center"
          >
            <BNavItem to="/" active-class="active">Trang Chủ</BNavItem>
            <BNavItem to="/menu" active-class="active">Thực Đơn</BNavItem>
            <BNavItem href="#">Liên Hệ</BNavItem>
          </BNavbarNav>

          <BNavbarNav class="ms-auto align-items-center gap-3 right-nav-items">
            <BNavItem
              @click="toggleSearch"
              class="icon-link p-0"
              style="cursor: pointer"
            >
              <i class="bi bi-search text-white fs-5"></i>
            </BNavItem>

            <BNavItem
              to="/cart"
              class="icon-link p-0 d-flex align-items-center"
            >
              <i class="bi bi-cart3 text-white fs-4"></i>
            </BNavItem>

            <template v-if="!currentUser">
              <div class="d-flex align-items-center gap-2">
                <router-link
                  to="/login"
                  class="btn-nav-white text-decoration-none"
                  >Đăng nhập</router-link
                >
                <router-link
                  to="/register"
                  class="btn-nav-outline text-decoration-none"
                  >Đăng ký</router-link
                >
              </div>
            </template>

            <BNavItemDropdown
              v-else
              right
              no-caret
              class="user-dropdown ms-2 p-0"
            >
              <template #button-content>
                <div class="user-avatar">
                  <i class="bi bi-person-fill"></i>
                </div>
              </template>
              <BDropdownHeader>Chào, {{ currentUser.ho_ten }}</BDropdownHeader>
              
              <BDropdownItem to="/profile">Hồ sơ cá nhân</BDropdownItem>
              
              <BDropdownItem to="/my-orders">Đơn mua</BDropdownItem>
              <template v-if="currentUser.roles?.includes('Admin')">
                <BDropdownDivider />
                <BDropdownItem to="/admin/dashboard"
                  >Trang Quản Trị</BDropdownItem
                >
              </template>
              <BDropdownDivider />
              <BDropdownItem @click="handleLogout" variant="danger"
                >Đăng xuất</BDropdownItem
              >
            </BNavItemDropdown>
          </BNavbarNav>
        </BCollapse>
      </BContainer>
    </BNavbar>

    <transition name="slide-down">
      <div v-if="showSearchBar" class="search-bar-container py-3">
        <BContainer>
          <BInputGroup>
            <BFormInput
              id="header-search-input"
              v-model="searchQuery"
              placeholder="Tìm kiếm đồ uống..."
              @keyup.enter="performSearch"
              class="search-input border-0"
            />
            <BButton variant="coffee-primary" @click="performSearch">
              <i class="bi bi-search"></i> Tìm
            </BButton>
            <BButton variant="outline-secondary" @click="toggleSearch">
              <i class="bi bi-x-lg"></i>
            </BButton>
          </BInputGroup>
        </BContainer>
      </div>
    </transition>
    <router-view />
  </div>
</template>

<style>

body {
  margin: 0;
  padding: 0;
  background-color: #fffbf2;
  font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.custom-navbar {
  background-color: #5d4037 !important;
  height: 65px;
  padding: 0 !important;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
.brand-logo {
  color: #fff !important;
  font-size: 1.1rem;
  margin-right: 0;
  text-decoration: none;
}
.nav-logo-icon {
  background: white;
  color: #5d4037;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.main-menu .nav-link {
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 0.85rem;
  letter-spacing: 1px;
  padding: 0 15px !important;
  transition: all 0.3s;
  line-height: 65px;
}
.main-menu .nav-link:hover,
.main-menu .nav-link.active {
  color: #fff !important;
  font-weight: 700;
  background-color: rgba(255, 255, 255, 0.1);
}
.icon-link .nav-link {
  color: #fff !important;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  opacity: 0.9;
}
.icon-link .nav-link:hover {
  opacity: 1;
  transform: scale(1.1);
}
.btn-nav-white {
  background-color: #fff;
  color: #5d4037 !important;
  padding: 6px 15px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.8rem;
  display: inline-block;
  transition: 0.3s;
}
.btn-nav-white:hover {
  background-color: #f0f0f0;
}
.btn-nav-outline {
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: #fff !important;
  padding: 6px 15px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.8rem;
  display: inline-block;
  transition: 0.3s;
}
.btn-nav-outline:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: #fff;
}
.user-avatar {
  width: 35px;
  height: 35px;
  background-color: #3e2723;
  color: #d4a574;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d4a574;
}
.user-dropdown .dropdown-toggle::after {
  display: none;
}

.search-bar-container {
  background-color: #4e342e;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 65px;
  z-index: 999;
}
.search-input {
  background-color: #fffbf2;
  color: #5d4037;
}
.search-input::placeholder {
  color: #8d6e63;
}
.btn-coffee-primary {
  background-color: #d4a574;
  border-color: #d4a574;
  color: #fff;
}
.btn-coffee-primary:hover {
  background-color: #c29363;
  border-color: #c29363;
  color: #fff;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>