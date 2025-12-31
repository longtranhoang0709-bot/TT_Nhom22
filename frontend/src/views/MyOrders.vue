<script setup>
import { ref, onMounted } from "vue";
import { getMyOrders, getOrderDetail, cancelOrder } from "../api/order";

const orders = ref([]);
const loading = ref(true);
const selectedOrder = ref(null);
const showModal = ref(false);

// Hàm format tiền tệ
const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    price
  );

// Hàm format ngày tháng
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return (
    date.toLocaleDateString("vi-VN") + " " + date.toLocaleTimeString("vi-VN")
  );
};

// Gọi API lấy danh sách đơn hàng
const fetchMyOrders = async () => {
  try {
    const res = await getMyOrders();
    orders.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Xem chi tiết đơn hàng
const viewDetail = async (orderId) => {
  try {
    const res = await getOrderDetail(orderId);
    selectedOrder.value = res.data;
    showModal.value = true;
  } catch (err) {
    console.error(err);
    alert("Lỗi tải chi tiết đơn hàng: " + (err.response?.data || err.message));
  }
};
// Hủy đơn hàng
const handleCancel = async (orderId) => {
  if (
    !confirm(
      "Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này sẽ hoàn lại kho."
    )
  )
    return;

  try {
    await cancelOrder(orderId);
    alert("Đã hủy đơn hàng thành công!");
    fetchMyOrders();
  } catch (err) {
    alert("Lỗi hủy đơn: " + (err.response?.data || err.message));
  }
};
onMounted(fetchMyOrders);
</script>

<template>
  <BContainer class="py-5">
    <h2 class="mb-4 text-coffee fw-bold">Lịch sử đơn hàng</h2>

    <div v-if="loading" class="text-center">
      <BSpinner label="Đang tải..." />
    </div>

    <div v-else-if="orders.length === 0" class="text-center text-muted">
      <p>Bạn chưa có đơn hàng nào.</p>
      <BButton to="/menu" variant="primary">Đặt món ngay</BButton>
    </div>

    <BCard v-else no-body class="shadow-sm">
      <BTableSimple responsive hover>
        <thead class="bg-light">
          <tr>
            <th>Mã đơn</th>
            <th>Ngày đặt</th>
            <th>Địa chỉ</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.ma_don_hang">
            <td>#{{ order.ma_don_hang }}</td>
            <td>{{ formatDate(order.ngay_tao) }}</td>
            <td class="text-truncate" style="max-width: 200px">
              {{ order.dia_chi_giao }}
            </td>
            <td class="fw-bold text-danger">
              {{ formatPrice(order.tong_tien) }}
            </td>
            <td>
              <BBadge
                :variant="
                  order.trang_thai === 'Pending'
                    ? 'warning'
                    : order.trang_thai === 'Cancelled'
                    ? 'danger'
                    : 'success'
                "
              >
                {{ order.trang_thai }}
              </BBadge>
            </td>
            <td>
              <div class="d-flex gap-2">
                <BButton
                  size="sm"
                  variant="outline-primary"
                  @click="viewDetail(order.ma_don_hang)"
                >
                  Xem
                </BButton>

                <BButton
                  v-if="order.trang_thai === 'Pending'"
                  size="sm"
                  variant="outline-danger"
                  @click="handleCancel(order.ma_don_hang)"
                >
                  Hủy
                </BButton>
              </div>
            </td>
          </tr>
        </tbody>
      </BTableSimple>
    </BCard>

    <BModal v-model="showModal" title="Chi tiết đơn hàng" size="lg" hide-footer>
      <div v-if="selectedOrder">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <p class="mb-1">
              <strong>Mã đơn:</strong> #{{ selectedOrder.ma_don_hang }}
            </p>
            <p class="mb-1">
              <strong>Người nhận:</strong> {{ selectedOrder.so_dien_thoai }}
            </p>
          </div>
          <BBadge
            :variant="
              selectedOrder.trang_thai === 'Pending' ? 'warning' : 'success'
            "
            class="fs-6"
          >
            {{ selectedOrder.trang_thai }}
          </BBadge>
        </div>
        <p>
          <strong>Ghi chú:</strong> {{ selectedOrder.ghi_chu || "Không có" }}
        </p>

        <BTableSimple bordered class="mt-3">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Giá</th>
              <th>SL</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in selectedOrder.items" :key="item.ma_chi_tiet">
              <td>
                <div class="d-flex align-items-center gap-2">
                  <BImg
                    :src="
                      item.duong_dan_anh
                        ? `http://localhost:3000${item.duong_dan_anh}`
                        : 'https://via.placeholder.com/50'
                    "
                    style="width: 40px; height: 40px; object-fit: cover"
                  />
                  {{ item.ten_san_pham }}
                </div>
              </td>
              <td>{{ formatPrice(item.don_gia) }}</td>
              <td>x{{ item.so_luong }}</td>
              <td class="fw-bold">
                {{ formatPrice(item.don_gia * item.so_luong) }}
              </td>
            </tr>
          </tbody>
        </BTableSimple>

        <div class="text-end fw-bold fs-5 text-danger">
          Tổng cộng: {{ formatPrice(selectedOrder.tong_tien) }}
        </div>
      </div>
    </BModal>
  </BContainer>
</template>

<style scoped>
.text-coffee {
  color: #5d4037;
}
</style>
