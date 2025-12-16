<script setup>
import { ref, onMounted } from 'vue';
import { getAllProducts } from '../api/products';

const featuredProducts = ref([]);
const API_URL = "http://localhost:3000"; 

// Hàm lấy ảnh
const getImageUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/300x200?text=No+Image';
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
};

// Hàm format tiền tệ
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Gọi API lấy 4 sản phẩm mới nhất
const fetchFeaturedProducts = async () => {
  try {
    const res = await getAllProducts({ limit: 4, page: 1 });
    
    if (res.data && res.data.data) {
      featuredProducts.value = res.data.data.slice(0, 4);
    }
  } catch (err) {
    console.error("Lỗi tải sản phẩm nổi bật:", err);
  }
};

onMounted(fetchFeaturedProducts);
</script>

<template>
  <div class="home-page">
    <section class="main-hero-banner d-flex align-items-center text-center">
      <div class="overlay"></div> 
      <BContainer class="position-relative z-1 text-white py-5">
        <h1 class="display-3 fw-bold mb-4" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
          Bắt đầu ngày mới với <br> một tách cà phê tuyệt vời
        </h1>
        <p class="lead mb-5 text-white-50 fs-4">
          Hương vị đậm đà, đánh thức mọi giác quan
        </p>
        <router-link to="/menu" class="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold fs-5 shadow-lg">
          ĐẶT HÀNG NGAY
        </router-link>
      </BContainer>
    </section>

    <section class="text-center py-5 mt-4">
      <BContainer>
        <h2 class="display-5 fw-bold text-coffee mb-3">Đồ Uống Đặc Biệt</h2>
        <p class="text-muted lead">
          Tuyển chọn những hương vị được yêu thích nhất tại quán
        </p>
        <div class="coffee-divider mx-auto my-4"></div> 
      </BContainer>
    </section>

    <section class="products-section pb-5">
      <BContainer>
        <div v-if="featuredProducts.length === 0" class="text-center py-5">
            <BSpinner variant="secondary" label="Đang tải..." />
        </div>

        <BRow v-else>
          <BCol md="3" v-for="product in featuredProducts" :key="product.ma_san_pham" class="mb-4">
            <BCard no-body class="h-100 border-0 shadow product-card">
              <div class="img-container">
                <img :src="getImageUrl(product.duong_dan_anh)" :alt="product.ten_san_pham" class="card-img-top">
              </div>
              <BCardBody class="text-center d-flex flex-column">
                <h5 class="card-title text-coffee fw-bold text-truncate" :title="product.ten_san_pham">
                    {{ product.ten_san_pham }}
                </h5>
                <p class="card-text text-muted small flex-grow-1 clamp-text">
                    {{ product.mo_ta || 'Hương vị tuyệt hảo đang chờ bạn thưởng thức.' }}
                </p>
                <div class="mt-3">
                  <h5 class="text-primary fw-bold mb-0">{{ formatPrice(product.gia) }}</h5>
                </div>
              </BCardBody>
            </BCard>
          </BCol>
        </BRow>

        <div class="text-center mt-5 mb-5">
          <router-link to="/menu" class="btn btn-outline-coffee btn-lg px-5 rounded-pill">
            Xem Toàn Bộ Thực Đơn <i class="bi bi-arrow-right ms-2"></i>
          </router-link>
        </div>
      </BContainer>
    </section>
  </div>
</template>

<style scoped>

.main-hero-banner {
  background-image: url('@/assets/image1.png'); 
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 600px; 
  position: relative;
}

.overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(87, 65, 53, 0.7);
}

.z-1 { z-index: 1; }
.text-coffee { color: #4E342E; }
.home-page { background-color: #FFFBF2; }
.coffee-divider { height: 3px; width: 60px; background-color: #4E342E; }

.product-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 20px;
  overflow: hidden;
  background: white;
}
.product-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(78, 52, 46, 0.2) !important;
}

.img-container { height: 220px; overflow: hidden; background-color: #f8f9fa; }
.img-container img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.product-card:hover .img-container img { transform: scale(1.1); }


.clamp-text {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}


.btn-primary { background-color: #d4a574; border-color: #d4a574; color: #fff; }
.btn-primary:hover { background-color: #c29363; border-color: #c29363; }
.btn-outline-coffee { color: #4E342E; border: 2px solid #4E342E; font-weight: 600; }
.btn-outline-coffee:hover { background-color: #4E342E; color: white; }
</style>