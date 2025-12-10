<script setup>
import { ref, onMounted } from "vue";
import { getAllProducts } from "../api/products";
import CategorySidebar from "../components/CategorySidebar.vue";
import ProductCard from "../components/ProductCard.vue";

const products = ref([]);
const loading = ref(true);
const currentCategory = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);
const limit = 10; 
const searchQuery = ref("");

// Hàm gọi API
const fetchProducts = async (categoryId = null) => {
  loading.value = true;
  try {
    const params = { page: currentPage.value, limit: limit };
    if (categoryId) params.category = categoryId;

    if (searchQuery.value) params.name = searchQuery.value;

    const res = await getAllProducts(params);

    if (res.data && res.data.data) {
      products.value = res.data.data;
      // Tính toán lại tổng số trang
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

const handleSearch = () => {
  currentPage.value = 1; 
  fetchProducts(currentCategory.value);
};

const handleFilterCategory = (id) => {
  currentCategory.value = id;
  currentPage.value = 1;
  fetchProducts(id);
};

const changePage = (page) => {
  currentPage.value = page;
  fetchProducts(currentCategory.value);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};


onMounted(() => {
  fetchProducts();
});
</script>
<template>
  <BContainer class="my-4">
    <BRow>
      <BCol md="3" lg="2" class="mb-4">
        <CategorySidebar 
          :currentCategory="currentCategory" 
          @select-category="handleFilterCategory" 
        />
      </BCol>

      <BCol md="9" lg="10">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h2 class="mb-0">
            Thực đơn
            <small v-if="currentCategory" class="text-muted fs-6">
              ({{ currentCategory === 1 ? 'Cà phê' : 'Bánh ngọt' }})
            </small>
          </h2>

          <div style="width: 300px; max-width: 100%">
            <BInputGroup>
              <BFormInput 
                v-model="searchQuery" 
                placeholder="Tìm tên món..." 
                @keyup.enter="handleSearch"
              />
              <BButton variant="primary" @click="handleSearch">🔍</BButton>
            </BInputGroup>
          </div>
        </div>
        <div v-if="loading" class="text-center py-5">
          <BSpinner variant="primary" label="Đang tải..."></BSpinner>
        </div>

        <BRow v-else>
          <ProductCard 
            v-for="p in products" 
            :key="p.ma_san_pham" 
            :product="p" 
          />
          
          <BCol cols="12" v-if="products.length === 0">
            <BAlert show variant="warning">
               Không tìm thấy sản phẩm nào.
            </BAlert>
          </BCol>
        </BRow>

        <div class="d-flex justify-content-center mt-4" v-if="products.length > 0">
          <BPagination
            v-model="currentPage"
            :total-rows="totalPages * 10" 
            :per-page="10"
            @update:model-value="changePage"
          />
        </div>
      </BCol>
    </BRow>
  </BContainer>
</template>