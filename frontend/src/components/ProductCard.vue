<script setup>
import { computed } from 'vue';

const props = defineProps({
  product: { type: Object, required: true }
});

const DEFAULT_IMG = "https://via.placeholder.com/150?text=No+Image";
const API_URL = "http://localhost:3000";

const imageUrl = computed(() => {
  if (!props.product.duong_dan_anh) return DEFAULT_IMG;
  if (props.product.duong_dan_anh.startsWith("/")) return `${API_URL}${props.product.duong_dan_anh}`;
  return props.product.duong_dan_anh;
});

const formattedPrice = computed(() => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(props.product.gia || 0);
});
</script>

<template>
  <BCol cols="12" sm="6" md="4" lg="3" class="mb-4">
    <BCard
      no-body 
      class="h-100 shadow-sm product-card"
    >
      <div class="img-wrapper">
        <BCardImg 
          :src="imageUrl" 
          alt="Image" 
          top 
          class="custom-img"
        />
      </div>

      <BCardBody class="d-flex flex-column">
        <BCardTitle class="text-truncate" :title="product.ten_san_pham">
          {{ product.ten_san_pham }}
        </BCardTitle>
        
        <BCardText class="flex-grow-1">
          <div class="text-danger fw-bold fs-5">{{ formattedPrice }}</div>
          <small class="text-muted">Kho: {{ product.so_luong || 0 }}</small>
        </BCardText>

        <BButton variant="primary" class="w-100 mt-auto">Thêm vào giỏ</BButton>
      </BCardBody>
    </BCard>
  </BCol>
</template>

<style scoped>

.img-wrapper {
  height: 200px; 
  overflow: hidden;
}

.custom-img {
  width: 100%;
  height: 100%;
  object-fit: cover; 
  transition: transform 0.3s ease;
}

.product-card:hover .custom-img {
  transform: scale(1.05); 
}
</style>