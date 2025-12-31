<script setup>
import { ref, onMounted } from "vue";
import { getAllProducts } from "../api/products";
import { getBanners } from "../api/content";
import { getTopReviews } from "../api/review";

const featuredProducts = ref([]);
const banners = ref([]);
const topReviews = ref([]);
const API_URL = "http://localhost:3000";

// Hàm xử lý ảnh
const getImageUrl = (path) => {
  if (!path) return "https://via.placeholder.com/300x200?text=No+Image";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const fetchHomeData = async () => {
  try {
    const bannerRes = await getBanners();
    banners.value = bannerRes.data || [];
  } catch (err) {
    console.warn("Chưa tải được banner:", err.message);
  }
  try {
    const productRes = await getAllProducts({ limit: 4, page: 1 });
    if (productRes.data && productRes.data.data) {
      featuredProducts.value = productRes.data.data.slice(0, 4);
    } else if (Array.isArray(productRes.data)) {
      featuredProducts.value = productRes.data.slice(0, 4);
    }
  } catch (err) {
    console.error("Lỗi tải sản phẩm nổi bật:", err);
  }
  try {
    const res = await getTopReviews();
    topReviews.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

onMounted(fetchHomeData);
</script>

<template>
  <div class="home-page">
    <section v-if="banners.length > 0" class="hero-carousel-section">
      <BCarousel
        controls
        indicators
        :interval="4000"
        fade
        style="text-shadow: 1px 1px 2px #333"
      >
        <BCarouselSlide v-for="b in banners" :key="b.ma_banner">
          <template #img>
            <div class="carousel-img-wrapper">
              <img
                :src="getImageUrl(b.anh_url)"
                class="d-block w-100 h-100"
                style="object-fit: cover"
                alt="Banner"
              />
              <div class="overlay"></div>
            </div>
          </template>

          <div
            class="d-flex flex-column align-items-center justify-content-center h-100 custom-caption"
          >
            <h1 class="display-3 fw-bold mb-4 text-uppercase">
              {{ b.tien_ket || "CÀ PHÊ PL" }}
            </h1>
            <p class="lead mb-5 text-white-50 fs-4 d-none d-md-block">
              Hương vị đậm đà, đánh thức mọi giác quan
            </p>
            <router-link
              to="/menu"
              class="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold fs-5 shadow-lg"
            >
              ĐẶT HÀNG NGAY
            </router-link>
          </div>
        </BCarouselSlide>
      </BCarousel>
    </section>

    <section
      v-else
      class="main-hero-banner d-flex align-items-center text-center"
    >
      <div class="overlay"></div>
      <BContainer class="position-relative z-1 text-white py-5">
        <h1
          class="display-3 fw-bold mb-4"
          style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5)"
        >
          Bắt đầu ngày mới với <br />
          một tách cà phê tuyệt vời
        </h1>
        <p class="lead mb-5 text-white-50 fs-4">
          Hương vị đậm đà, đánh thức mọi giác quan
        </p>
        <router-link
          to="/menu"
          class="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold fs-5 shadow-lg"
        >
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
          <BCol
            md="3"
            v-for="product in featuredProducts"
            :key="product.ma_san_pham"
            class="mb-4"
          >
            <BCard no-body class="h-100 border-0 shadow product-card">
              <div class="img-container">
                <img
                  :src="getImageUrl(product.duong_dan_anh)"
                  :alt="product.ten_san_pham"
                  class="card-img-top"
                />
              </div>
              <BCardBody class="text-center d-flex flex-column">
                <h5
                  class="card-title text-coffee fw-bold text-truncate"
                  :title="product.ten_san_pham"
                >
                  {{ product.ten_san_pham }}
                </h5>
                <p class="card-text text-muted small flex-grow-1 clamp-text">
                  {{
                    product.mo_ta ||
                    "Hương vị tuyệt hảo đang chờ bạn thưởng thức."
                  }}
                </p>
                <div class="mt-3">
                  <h5 class="text-primary fw-bold mb-0">
                    {{ formatPrice(product.gia) }}
                  </h5>
                </div>
              </BCardBody>
            </BCard>
          </BCol>
        </BRow>

        <div class="text-center mt-5 mb-5">
          <router-link
            to="/menu"
            class="btn btn-outline-coffee btn-lg px-5 rounded-pill"
          >
            Xem Toàn Bộ Thực Đơn <i class="bi bi-arrow-right ms-2"></i>
          </router-link>
        </div>
      </BContainer>
    </section>
    <section class="reviews-section py-5" style="background-color: #fff8e1">
      <BContainer>
        <div class="text-center mb-5">
          <h2 class="display-5 fw-bold text-coffee">
            Khách Hàng Nói Gì Về Chúng Tôi
          </h2>
          <p class="text-muted lead">
            Đừng chỉ tin lời chúng tôi - hãy lắng nghe từ cộng đồng yêu cà phê
          </p>
        </div>

        <BRow>
          <BCol
            md="4"
            v-for="review in topReviews"
            :key="review.ma_phan_hoi"
            class="mb-4"
          >
            <BCard class="h-100 border-0 shadow-sm p-3 text-start review-card">
              <div class="text-warning mb-3 fs-5">
                <i
                  v-for="n in 5"
                  :key="n"
                  :class="
                    n <= review.danh_gia ? 'bi bi-star-fill' : 'bi bi-star'
                  "
                ></i>
              </div>
              <p class="card-text fst-italic text-secondary">
                "{{ review.noi_dung }}"
              </p>
              <hr class="my-3 opacity-25" />
              <div>
                <h6 class="fw-bold text-coffee mb-0">{{ review.ho_ten }}</h6>
                <small class="text-muted">{{
                  new Date(review.ngay_gui).toLocaleDateString("vi-VN")
                }}</small>
              </div>
            </BCard>
          </BCol>
        </BRow>

        <div class="text-center mt-4">
          <BButton
            to="/reviews"
            variant="outline-dark"
            class="px-4 py-2 rounded-pill"
          >
            Xem Tất Cả Đánh Giá <i class="bi bi-arrow-right"></i>
          </BButton>
        </div>
      </BContainer>
    </section>
  </div>
</template>

<style scoped>
.main-hero-banner {
  background-image: url("@/assets/image1.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 600px;
  position: relative;
}

.hero-carousel-section {
  height: 600px;
  background-color: #333;
}
.carousel-img-wrapper {
  height: 600px;
  position: relative;
}
.custom-caption {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  text-align: center;
  color: white;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(87, 65, 53, 0.6);
}
.z-1 {
  z-index: 1;
}
.text-coffee {
  color: #4e342e;
}
.home-page {
  background-color: #fffbf2;
}
.coffee-divider {
  height: 3px;
  width: 60px;
  background-color: #4e342e;
}

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

.img-container {
  height: 220px;
  overflow: hidden;
  background-color: #f8f9fa;
}
.img-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.product-card:hover .img-container img {
  transform: scale(1.1);
}

.clamp-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-primary {
  background-color: #d4a574;
  border-color: #d4a574;
  color: #fff;
}
.btn-primary:hover {
  background-color: #c29363;
  border-color: #c29363;
}
.btn-outline-coffee {
  color: #4e342e;
  border: 2px solid #4e342e;
  font-weight: 600;
}
.btn-outline-coffee:hover {
  background-color: #4e342e;
  color: white;
}
</style>
