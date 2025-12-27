<script setup>
import { ref, onMounted, computed } from "vue";
import { getCart, updateCartItem, removeCartItem, checkout } from "../api/cart";
import { checkCoupon } from "../api/promotion";
import { useRouter } from "vue-router";

const router = useRouter();
const cartItems = ref([]);
const totalAmount = ref(0);
const loading = ref(true);
const API_URL = "http://localhost:3000";

// Trạng thái thanh toán
const paymentMethod = ref("COD");
const qrUrl = ref(null);
const showQRModal = ref(false);

// Mã giảm giá
const couponCode = ref("");
const discountPercent = ref(0);
const discountAmount = computed(
  () => totalAmount.value * (discountPercent.value / 100)
);
const finalTotal = computed(() => totalAmount.value - discountAmount.value);

const applyCoupon = async () => {
  if (!couponCode.value) return alert("Vui lòng nhập mã!");
  try {
    const res = await checkCoupon(couponCode.value, totalAmount.value);
    discountPercent.value = res.data.discountPercent;
    alert(`Áp dụng mã thành công! Bạn được giảm ${discountPercent.value}%`);
  } catch (err) {
    alert(err.response?.data || "Mã không hợp lệ hoặc chưa đủ điều kiện");
    discountPercent.value = 0;
  }
};

const customerInfo = ref({
  address: "",
  phone: "",
  note: "",
});

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    price
  );

const fetchCart = async () => {
  loading.value = true;
  try {
    const res = await getCart();
    cartItems.value = res.data.items || [];
    totalAmount.value = res.data.total || 0;
  } catch (err) {
    if (
      err.response &&
      (err.response.status === 401 || err.response.status === 403)
    ) {
      router.push("/login");
    }
  } finally {
    loading.value = false;
  }
};

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

const removeItem = async (productId) => {
  if (!confirm("Xóa sản phẩm này khỏi giỏ?")) return;
  try {
    const res = await removeCartItem(productId);
    cartItems.value = cartItems.value.filter(
      (i) => i.ma_san_pham !== productId
    );
    totalAmount.value = res.data.totalAmount;
  } catch (err) {
    alert("Lỗi xóa: " + err.message);
  }
};

const handleCheckout = async () => {
  if (!customerInfo.value.address || !customerInfo.value.phone) {
    alert("Vui lòng nhập địa chỉ và số điện thoại!");
    return;
  }
  if (cartItems.value.length === 0) return alert("Giỏ hàng trống!");

  try {
    const res = await checkout({
      ...customerInfo.value,
      paymentMethod: paymentMethod.value,
      couponCode: discountPercent.value > 0 ? couponCode.value : null,
    });

    if (res.data.qrCodeUrl) {
      qrUrl.value = res.data.qrCodeUrl;
      showQRModal.value = true;
    } else {
      alert("Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.");
      router.push("/my-orders");
    }

    // Reset giỏ hàng local
    cartItems.value = [];
    totalAmount.value = 0;
  } catch (err) {
    alert("Đặt hàng thất bại: " + (err.response?.data || err.message));
  }
};

onMounted(fetchCart);
</script>

<template>
  <BContainer class="py-4">
    <h2 class="mb-4 fw-bold text-coffee">Giỏ hàng của bạn</h2>

    <div v-if="loading" class="text-center py-5">
      <BSpinner variant="primary" label="Loading..."></BSpinner>
    </div>

    <div
      v-else-if="cartItems.length === 0"
      class="text-center py-5 border rounded bg-white shadow-sm"
    >
      <i class="bi bi-cart-x fs-1 text-muted"></i>
      <h4 class="mt-3">Giỏ hàng đang trống</h4>
      <BButton variant="primary" to="/menu" class="mt-3 px-4"
        >Tiếp tục mua sắm</BButton
      >
    </div>

    <BRow v-else>
      <BCol lg="8">
        <BCard no-body class="shadow-sm mb-4 border-0">
          <BTableSimple responsive hover class="mb-0">
            <thead class="table-light">
              <tr>
                <th class="py-3">Sản phẩm</th>
                <th class="py-3">Giá</th>
                <th class="py-3 text-center">Số lượng</th>
                <th class="py-3 text-end">Thành tiền</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in cartItems" :key="item.ma_san_pham">
                <td class="py-3">
                  <div class="d-flex align-items-center gap-3">
                    <BImg
                      :src="
                        item.duong_dan_anh
                          ? `${API_URL}${item.duong_dan_anh}`
                          : 'https://via.placeholder.com/60'
                      "
                      style="width: 60px; height: 60px; object-fit: cover"
                      class="rounded shadow-sm"
                    />
                    <div>
                      <div class="fw-bold">{{ item.ten_san_pham }}</div>
                    </div>
                  </div>
                </td>
                <td class="align-middle text-muted">
                  {{ formatPrice(item.gia) }}
                </td>
                <td class="align-middle text-center" style="width: 140px">
                  <BInputGroup size="sm">
                    <BButton
                      variant="outline-secondary"
                      @click="updateQuantity(item, -1)"
                      >-</BButton
                    >
                    <BFormInput
                      :model-value="item.so_luong"
                      readonly
                      class="text-center fw-bold"
                    />
                    <BButton
                      variant="outline-secondary"
                      @click="updateQuantity(item, 1)"
                      >+</BButton
                    >
                  </BInputGroup>
                </td>
                <td class="align-middle text-end fw-bold text-coffee">
                  {{ formatPrice(item.gia * item.so_luong) }}
                </td>
                <td class="align-middle text-end">
                  <BButton
                    variant="link"
                    class="text-danger p-0"
                    @click="removeItem(item.ma_san_pham)"
                  >
                    <i class="bi bi-trash fs-5"></i>
                  </BButton>
                </td>
              </tr>
            </tbody>
          </BTableSimple>
        </BCard>
      </BCol>

      <BCol lg="4">
        <BCard class="shadow-sm border-0 mb-4">
          <template #header>
            <h5 class="mb-0 fw-bold py-1">Thông tin giao hàng</h5>
          </template>

          <BForm @submit.prevent="handleCheckout">
            <BFormGroup label="Địa chỉ nhận hàng (*)" class="mb-3">
              <BFormInput
                v-model="customerInfo.address"
                required
                placeholder="Số nhà, tên đường, phường..."
              />
            </BFormGroup>

            <BFormGroup label="Số điện thoại (*)" class="mb-3">
              <BFormInput
                v-model="customerInfo.phone"
                required
                placeholder="Ví dụ: 0987654321"
              />
            </BFormGroup>

            <BFormGroup label="Ghi chú" class="mb-4">
              <BFormTextarea
                v-model="customerInfo.note"
                rows="2"
                placeholder="Lời nhắn cho quán (ví dụ: ít đường)..."
              />
            </BFormGroup>

            <div class="mb-4">
              <label class="form-label fw-bold">Phương thức thanh toán</label>
              <div class="payment-methods border rounded p-2">
                <BFormRadioGroup v-model="paymentMethod" stacked>
                  <BFormRadio value="COD" class="mb-2">
                    <i class="bi bi-truck me-2"></i>Tiền mặt khi nhận hàng
                  </BFormRadio>
                  <BFormRadio value="Momo" class="mb-2">
                    <i class="bi bi-wallet2 me-2"></i>Ví điện tử Momo (Mã QR)
                  </BFormRadio>
                  <BFormRadio value="ChuyenKhoan">
                    <i class="bi bi-bank me-2"></i>Chuyển khoản VietQR
                  </BFormRadio>
                </BFormRadioGroup>
              </div>
            </div>

            <div class="mb-4 p-3 bg-light rounded border border-dashed">
              <label class="form-label fw-bold text-muted small text-uppercase"
                >Mã Khuyến Mãi</label
              >
              <BInputGroup>
                <BFormInput
                  v-model="couponCode"
                  placeholder="Nhập mã..."
                  size="sm"
                />
                <BButton variant="secondary" size="sm" @click="applyCoupon"
                  >Áp dụng</BButton
                >
              </BInputGroup>
              <div
                v-if="discountPercent > 0"
                class="text-success small mt-2 fw-bold"
              >
                <i class="bi bi-check-circle-fill"></i> Đã áp dụng mã giảm
                {{ discountPercent }}%
              </div>
            </div>

            <hr class="my-4" />

            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Tạm tính:</span>
              <span>{{ formatPrice(totalAmount) }}</span>
            </div>

            <div
              v-if="discountPercent > 0"
              class="d-flex justify-content-between mb-2 text-success"
            >
              <span>Giảm giá:</span>
              <span>- {{ formatPrice(discountAmount) }}</span>
            </div>

            <div class="d-flex justify-content-between mb-4 align-items-center">
              <span class="fw-bold fs-5">Tổng cộng:</span>
              <span class="fw-bold fs-3 text-danger">{{
                formatPrice(finalTotal)
              }}</span>
            </div>

            <BButton
              type="submit"
              variant="success"
              size="lg"
              class="w-100 fw-bold py-3 shadow-sm"
            >
              <span v-if="paymentMethod === 'COD'">ĐẶT HÀNG NGAY</span>
              <span v-else>THANH TOÁN & ĐẶT HÀNG</span>
            </BButton>
          </BForm>
        </BCard>
      </BCol>
    </BRow>

    <BModal
      v-model="showQRModal"
      title="Quét mã thanh toán"
      hide-footer
      centered
      no-close-on-backdrop
    >
      <div class="text-center p-2">
        <h5 class="mb-3 fw-bold">
          Tổng tiền:
          <span class="text-danger">{{ formatPrice(finalTotal) }}</span>
        </h5>
        <p class="small text-muted mb-4">
          Vui lòng sử dụng ứng dụng Ngân hàng hoặc Momo để quét mã bên dưới.
        </p>

        <div
          class="qr-container p-3 border rounded bg-white shadow-sm d-inline-block mb-4"
        >
          <BImg :src="qrUrl" fluid alt="QR Code" style="max-width: 280px" />
        </div>

        <div class="alert alert-warning small text-start">
          <i class="bi bi-info-circle-fill me-2"></i>
          Sau khi chuyển khoản thành công, hãy nhấn nút bên dưới. Nhân viên sẽ
          gọi điện xác nhận sau 2-5 phút.
        </div>

        <BButton
          variant="primary"
          class="w-100 fw-bold py-2 mt-2"
          @click="router.push('/my-orders')"
        >
          TÔI ĐÃ THANH TOÁN XONG
        </BButton>
      </div>
    </BModal>
  </BContainer>
</template>

<style scoped>
.text-coffee {
  color: #4e342e;
}
.bg-coffee {
  background-color: #4e342e;
}
.border-dashed {
  border-style: dashed !important;
}

.payment-methods :deep(.form-check) {
  padding: 10px 10px 10px 35px;
  border-radius: 8px;
  transition: 0.2s;
  cursor: pointer;
  margin-bottom: 5px !important;
}

.payment-methods :deep(.form-check:hover) {
  background-color: #f8f9fa;
}

.payment-methods :deep(.form-check-input:checked + .form-check-label) {
  font-weight: bold;
  color: #198754;
}

.qr-container {
  background: #fff;
}
</style>
