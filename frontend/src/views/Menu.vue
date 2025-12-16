<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getAllProducts } from "../api/products";
import { addToCart } from "../api/cart";
import CategorySidebar from "../components/CategorySidebar.vue";

const route = useRoute();
const router = useRouter();
const products = ref([]);
const loading = ref(true);
const currentCategory = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);
const limit = 12;
const processingMap = ref({}); 

const API_URL = "http://localhost:3000";

// Hàm format giá tiền
const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    price
  );

// Hàm xử lý đường dẫn ảnh
const getImageUrl = (path) => {
  if (!path) return "https://via.placeholder.com/300x200?text=No+Image";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
};

// Hàm gọi API lấy sản phẩm
const fetchProducts = async () => {
  loading.value = true;
  try {
    const searchKeyword = route.query.q || "";
    const params = {
      page: currentPage.value,
      limit: limit,
      name: searchKeyword,
    };
    if (currentCategory.value) params.category = currentCategory.value;

    const res = await getAllProducts(params);

    if (res.data && res.data.data) {
      products.value = res.data.data;
      const total = res.data.pagination.total;
      totalPages.value = Math.ceil(total / limit);
    } else {
      products.value = [];
      totalPages.value = 1;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};


const handleAddToCart = async (product) => {
  if (!localStorage.getItem("accessToken")) {
    if (confirm("Vui lòng đăng nhập để mua hàng!")) {
      router.push("/login");
    }
    return;
  }

  // 2. Xử lý thêm vào giỏ
  processingMap.value[product.ma_san_pham] = true;

  try {
    await addToCart(product.ma_san_pham, 1);
    alert(`Đã thêm "${product.ten_san_pham}" vào giỏ hàng!`);
  } catch (err) {
    console.error(err);
    alert("Lỗi: " + (err.response?.data || err.message));
  } finally {
    processingMap.value[product.ma_san_pham] = false;
  }
};

const handleFilterCategory = (id) => {
  currentCategory.value = id;
  currentPage.value = 1;
  fetchProducts();
};

const changePage = (page) => {
  currentPage.value = page;
  fetchProducts();
  window.scrollTo({ top: 400, behavior: "smooth" });
};

watch(
  () => route.query.q,
  () => {
    currentPage.value = 1;
    fetchProducts();
  }
);

onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <div class="menu-page">
    <section
      class="menu-banner d-flex align-items-center justify-content-center"
    >
      <div class="overlay"></div>
      <div class="content position-relative z-1 text-white text-center">
        <h1 class="display-4 fw-bold text-uppercase tracking-wide">Thực Đơn</h1>
        <p class="lead fs-5">Khám phá thế giới hương vị của Phước Long</p>
      </div>
    </section>

    <BContainer class="my-5">
      <div v-if="route.query.q" class="mb-4 text-coffee">
        Kết quả tìm kiếm cho:
        <span class="fw-bold fs-5">"{{ route.query.q }}"</span>
        <router-link to="/menu" class="ms-3 text-danger text-decoration-none">
          <i class="bi bi-x-circle"></i> Xóa tìm kiếm
        </router-link>
      </div>

      <BRow>
        <BCol md="3" lg="2" class="mb-4">
          <CategorySidebar
            :currentCategory="currentCategory"
            @select-category="handleFilterCategory"
          />
        </BCol>

        <BCol md="9" lg="10">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0 text-coffee fw-bold">
              Danh sách món
              <small v-if="currentCategory" class="text-muted fs-6">
                ({{ currentCategory === 1 ? "Cà phê" : "Bánh ngọt" }})
              </small>
            </h2>
          </div>

          <div v-if="loading" class="text-center py-5">
            <BSpinner variant="primary" label="Đang tải..."></BSpinner>
          </div>

          <BRow v-else>
            <BCol
              lg="4"
              md="6"
              v-for="p in products"
              :key="p.ma_san_pham"
              class="mb-4"
            >
              <BCard no-body class="h-100 border-0 shadow product-card-menu">
                <div class="img-container-menu position-relative">
                  <img
                    :src="getImageUrl(p.duong_dan_anh)"
                    :alt="p.ten_san_pham"
                    class="card-img-top"
                  />

                  <div class="add-to-cart-overlay">
                    <BButton
                      variant="primary"
                      class="rounded-circle shadow-sm btn-quick-add"
                      @click="handleAddToCart(p)"
                      :disabled="
                        processingMap[p.ma_san_pham] || p.so_luong <= 0
                      "
                    >
                      <i class="bi bi-plus-lg"></i>
                    </BButton>
                  </div>
                </div>

                <BCardBody class="d-flex flex-column">
                  <h5
                    class="card-title text-coffee fw-bold text-truncate"
                    :title="p.ten_san_pham"
                  >
                    {{ p.ten_san_pham }}
                  </h5>

                  <p class="card-text text-muted small flex-grow-1 clamp-text">
                    {{ p.mo_ta || "Chưa có mô tả cho sản phẩm này." }}
                  </p>

                  <div
                    class="mt-3 d-flex justify-content-between align-items-center"
                  >
                    <h5 class="text-primary fw-bold mb-0">
                      {{ formatPrice(p.gia) }}
                    </h5>

                    <BButton
                      size="sm"
                      variant="primary"
                      class="rounded-pill px-3 fw-bold"
                      @click="handleAddToCart(p)"
                      :disabled="
                        processingMap[p.ma_san_pham] || p.so_luong <= 0
                      "
                    >
                      <span v-if="processingMap[p.ma_san_pham]">
                        <BSpinner small />
                      </span>
                      <span v-else>
                        {{ p.so_luong > 0 ? "Đặt mua" : "Hết hàng" }}
                      </span>
                    </BButton>
                  </div>
                </BCardBody>
              </BCard>
            </BCol>

            <BCol cols="12" v-if="products.length === 0">
              <BAlert show variant="warning" class="text-center">
                Không tìm thấy sản phẩm nào.
              </BAlert>
            </BCol>
          </BRow>

          <div
            class="d-flex justify-content-center mt-4"
            v-if="products.length > 0"
          >
            <BPagination
              v-model="currentPage"
              :total-rows="totalPages * limit"
              :per-page="limit"
              @update:model-value="changePage"
              pills
            />
          </div>
        </BCol>
      </BRow>
    </BContainer>
  </div>
</template>

<style scoped>
.menu-page {
  background-color: #fffbf2;
  min-height: 100vh;
}
.text-coffee {
  color: #4e342e;
}


.menu-banner {
  background-image: url("@/assets/image2.png");
  background-size: cover;
  background-position: center;
  height: 300px;
  position: relative;
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(78, 52, 46, 0.6);
}
.z-1 {
  z-index: 1;
}
.tracking-wide {
  letter-spacing: 2px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
}


.product-card-menu {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 15px;
  overflow: hidden;
  background: white;
}
.product-card-menu:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(78, 52, 46, 0.15) !important;
}
.img-container-menu {
  height: 200px;
  overflow: hidden;
  background-color: #f8f9fa;
}
.img-container-menu img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.product-card-menu:hover .img-container-menu img {
  transform: scale(1.05);
}


.clamp-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 10px;
}

/* Nút bấm */
.btn-primary {
  background-color: #d4a574;
  border-color: #d4a574;
  color: #fff;
  transition: all 0.3s;
}
.btn-primary:hover {
  background-color: #c29363;
  border-color: #c29363;
}
.btn-primary:disabled {
  background-color: #e0e0e0;
  border-color: #e0e0e0;
  color: #999;
}


.add-to-cart-overlay {
  position: absolute;
  bottom: 10px;
  right: 10px;
  opacity: 0;
  transition: all 0.3s;
}
.product-card-menu:hover .add-to-cart-overlay {
  opacity: 1;
  bottom: 15px;
}
.btn-quick-add {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}
</style>
