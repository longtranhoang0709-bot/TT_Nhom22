<script setup>
import { ref, onMounted, computed } from "vue";
import { getCart, updateCartItem, removeCartItem, checkout } from "../api/cart";
import { useRouter } from "vue-router";

const router = useRouter();
const cartItems = ref([]);
const totalAmount = ref(0);
const loading = ref(true);
const API_URL = "http://localhost:3000";

const customerInfo = ref({
  address: "",
  phone: "",
  note: ""
});

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

// Lấy dữ liệu giỏ hàng
const fetchCart = async () => {
  loading.value = true;
  try {
    const res = await getCart();
    cartItems.value = res.data.items || [];
    totalAmount.value = res.data.total || 0;
  } catch (err) {
    console.error(err);
    if(err.response && (err.response.status === 401 || err.response.status === 403)) {
        router.push('/login');
    }
  } finally {
    loading.value = false;
  }
};

// Cập nhật số lượng (+ / -)
const updateQuantity = async (item, change) => {
  const newQty = item.so_luong + change;
  if (newQty < 1) return; 
  item.so_luong = newQty;
  try {
    const res = await updateCartItem(item.ma_san_pham, newQty);
    totalAmount.value = res.data.totalAmount; 
  } catch (err) {
    alert("Lỗi cập nhật: " + err.message);
    fetchCart(); 
  }
};

// Xóa sản phẩm
const removeItem = async (productId) => {
  if (!confirm("Xóa sản phẩm này khỏi giỏ?")) return;
  try {
    const res = await removeCartItem(productId);
    cartItems.value = cartItems.value.filter(i => i.ma_san_pham !== productId);
    totalAmount.value = res.data.totalAmount;
  } catch (err) {
    alert("Lỗi xóa: " + err.message);
  }
};

// Xử lý đặt hàng
const handleCheckout = async () => {
  if (!customerInfo.value.address || !customerInfo.value.phone) {
    alert("Vui lòng nhập địa chỉ và số điện thoại!");
    return;
  }

  if (cartItems.value.length === 0) {
    alert("Giỏ hàng trống!");
    return;
  }

  try {
    await checkout(customerInfo.value);
    alert("Đặt hàng thành công!");
    cartItems.value = [];
    totalAmount.value = 0;
    // Chuyển hướng về trang chủ 
    router.push("/"); 
  } catch (err) {
    alert("Đặt hàng thất bại: " + (err.response?.data || err.message));
  }
};

onMounted(fetchCart);
</script>

<template>
  <BContainer class="py-4">
    <h2 class="mb-4">Giỏ hàng của bạn</h2>

    <div v-if="loading" class="text-center">
      <BSpinner label="Loading..."></BSpinner>
    </div>

    <div v-else-if="cartItems.length === 0" class="text-center py-5">
      <h4>Giỏ hàng đang trống</h4>
      <BButton variant="primary" to="/" class="mt-3">Tiếp tục mua sắm</BButton>
    </div>

    <BRow v-else>
      <BCol lg="8">
        <BCard no-body class="shadow-sm mb-4">
            <BTableSimple responsive hover class="mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Sản phẩm</th>
                        <th>Giá</th>
                        <th class="text-center">Số lượng</th>
                        <th class="text-end">Thành tiền</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in cartItems" :key="item.ma_san_pham">
                        <td>
                            <div class="d-flex align-items-center gap-2">
                                <BImg 
                                    :src="item.duong_dan_anh ? `${API_URL}${item.duong_dan_anh}` : 'https://via.placeholder.com/50'"
                                    style="width: 50px; height: 50px; object-fit: cover"
                                    thumbnail
                                />
                                <div>
                                    <div class="fw-bold">{{ item.ten_san_pham }}</div>
                                    <small class="text-muted">Kho: {{ item.ton_kho }}</small>
                                </div>
                            </div>
                        </td>
                        <td class="align-middle">{{ formatPrice(item.gia) }}</td>
                        <td class="align-middle text-center" style="width: 150px;">
                            <BInputGroup size="sm">
                                <BButton variant="outline-secondary" @click="updateQuantity(item, -1)">-</BButton>
                                <BFormInput 
                                    :model-value="item.so_luong" 
                                    readonly 
                                    class="text-center"
                                />
                                <BButton variant="outline-secondary" @click="updateQuantity(item, 1)">+</BButton>
                            </BInputGroup>
                        </td>
                        <td class="align-middle text-end fw-bold">
                            {{ formatPrice(item.gia * item.so_luong) }}
                        </td>
                        <td class="align-middle text-end">
                            <BButton variant="outline-danger" size="sm" @click="removeItem(item.ma_san_pham)">
                                <i class="bi bi-trash"></i> Xóa
                            </BButton>
                        </td>
                    </tr>
                </tbody>
            </BTableSimple>
        </BCard>
      </BCol>

      <BCol lg="4">
        <BCard title="Thông tin giao hàng" class="shadow-sm">
            <BForm @submit.prevent="handleCheckout">
                <BFormGroup label="Địa chỉ nhận hàng (*)" class="mb-2">
                    <BFormInput v-model="customerInfo.address" required placeholder="Số nhà, đường, quận..." />
                </BFormGroup>
                
                <BFormGroup label="Số điện thoại (*)" class="mb-2">
                    <BFormInput v-model="customerInfo.phone" required placeholder="09xxx..." />
                </BFormGroup>

                <BFormGroup label="Ghi chú" class="mb-3">
                    <BFormTextarea v-model="customerInfo.note" placeholder="Lời nhắn cho quán..." />
                </BFormGroup>

                <hr>
                <div class="d-flex justify-content-between mb-3">
                    <span class="fw-bold fs-5">Tổng cộng:</span>
                    <span class="fw-bold fs-4 text-danger">{{ formatPrice(totalAmount) }}</span>
                </div>

                <BButton type="submit" variant="success" size="lg" class="w-100">
                    ĐẶT HÀNG NGAY
                </BButton>
            </BForm>
        </BCard>
      </BCol>
    </BRow>
  </BContainer>
</template>