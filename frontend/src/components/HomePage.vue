<script setup>
import { ref, onMounted } from "vue";
import { getAllProducts } from "../api/products";

const products = ref([]);
const loading = ref(true);
const currentCategory = ref(null);
const API_URL = "http://localhost:3000";
const DEFAULT_IMG = "https://via.placeholder.com/150?text=No+Image";

const currentPage = ref(1); // Trang hiện tại
const totalPages = ref(1);  // Tổng số trang

// Hàm gọi API
// Thêm tham số categoryId để lọc theo
const fetchProducts = async (categoryId = null) => {
  loading.value = true;
  try {
    const params = { page: currentPage.value, limit: 10 };

    if (categoryId) {
      params.category = categoryId;
    }

    const res = await getAllProducts(params);

    if (res.data && res.data.data && Array.isArray(res.data.data)) {
      products.value = res.data.data;

      // Tính tổng số trang dựa trên 'total' backend trả về
      const totalItems = res.data.pagination.total;
      const limit = res.data.pagination.limit;
      totalPages.value = Math.ceil(totalItems / limit);
    } else {
      products.value = res.data;
    }
  } catch (err) {
    console.error("Lỗi tải sản phẩm:", err);
  } finally {
    loading.value = false;
  }
};

// Hàm chuyển trang
const changePage = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    currentPage.value = newPage;
    fetchProducts(currentCategory.value); // Gọi lại API lấy trang mới
    // Cuộn lên đầu trang cho đẹp
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// Sự kiện khi bấm vào menu bên trái
const filterCategory = (id) => {
  currentCategory.value = id;
  currentPage.value = 1;
  fetchProducts(id);
};

// Hàm lấy đường dẫn ảnh
const getImageUrl = (path) => {
  if (!path) return DEFAULT_IMG;
  if (path.startsWith("/")) return `${API_URL}${path}`;
  return path;
};

// Định dạng tiền Việt
const formatPrice = (value) => {
  if (value === undefined || value === null) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

// Tải danh sách sản phẩm lúc component được tạo
onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <div class="home-layout">
    <aside class="sidebar">
      <h3>Danh mục</h3>
      <ul>
        <li
          :class="{ active: currentCategory === null }"
          @click="filterCategory(null)"
        >
          Tất cả
        </li>
        <li
          :class="{ active: currentCategory === 1 }"
          @click="filterCategory(1)"
        >
          Cà phê
        </li>
        <li
          :class="{ active: currentCategory === 2 }"
          @click="filterCategory(2)"
        >
          Bánh ngọt
        </li>
      </ul>
    </aside>

    <main class="product-content">
      <h1>
        Thực đơn hôm nay
        <span v-if="currentCategory === 1">(Cà phê)</span>
        <span v-if="currentCategory === 2">(Bánh ngọt)</span>
      </h1>

      <div v-if="loading" style="text-align: center; padding: 20px">
        Đang tải dữ liệu...
      </div>

      <div class="product-grid" v-else>
        <div
          v-for="product in products"
          :key="product.ma_san_pham"
          class="card"
        >
          <img
            :src="getImageUrl(product.duong_dan_anh)"
            @error="$event.target.src = DEFAULT_IMG"
            alt="Product"
            class="product-img"
            loading="lazy"
          />
          <h3>{{ product.ten_san_pham }}</h3>
          <p class="price">{{ formatPrice(product.gia) }}</p>
          <p class="stock">
            Kho: {{ product.so_luong !== null ? product.so_luong : 0 }}
          </p>
          <button class="add-btn">Thêm vào giỏ</button>
        </div>

        <p v-if="products.length === 0" style="text-align: center; width: 100%">
          Chưa có sản phẩm nào trong danh mục này.
        </p>
      </div>
      <div class="pagination" v-if="!loading && products.length > 0">
        <button 
          :disabled="currentPage === 1" 
          @click="changePage(currentPage - 1)"
        >
          &laquo; Trước
        </button>

        <span>Trang {{ currentPage }} / {{ totalPages }}</span>

        <button 
          :disabled="currentPage === totalPages" 
          @click="changePage(currentPage + 1)"
        >
          Sau &raquo;
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-layout {
  display: flex;
  max-width: 1200px;
  margin: 20px auto;
  gap: 30px;
  padding: 0 20px;
}
.sidebar {
  width: 250px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  height: fit-content;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}
.sidebar h3 {
  margin-top: 0;
  color: #333;
}
.sidebar ul {
  list-style: none;
  padding: 0;
}
.sidebar li {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: all 0.2s;
}
.sidebar li:hover {
  background-color: #f5f5f5;
}
.sidebar li.active {
  color: #d84315;
  font-weight: bold;
  background-color: #fcebe6;
  border-left: 4px solid #d84315;
}
.product-content {
  flex: 1;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}
.card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  border: 1px solid #eee;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
.product-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}
h3 {
  font-size: 1.1rem;
  margin: 10px 0;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.8em;
}
.price {
  color: #d32f2f;
  font-weight: bold;
  font-size: 1.2rem;
  margin: 5px 0;
}
.stock {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 10px;
}
.add-btn {
  background: #3e2723;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  font-weight: bold;
}
.add-btn:hover {
  background: #5d4037;
}
.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.pagination button {
  padding: 8px 16px;
  background-color: #3e2723;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination button:hover:not(:disabled) {
  background-color: #5d4037;
}

.pagination span {
  font-weight: bold;
}
</style>
