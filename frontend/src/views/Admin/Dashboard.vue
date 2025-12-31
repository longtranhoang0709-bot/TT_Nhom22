<script setup>
import { ref, onMounted } from "vue";
import api from "../../api/axios";

const stats = ref({
  revenueToday: 0,
  pendingOrders: 0,
  completedToday: 0,
  lowStock: 0,
  lowStockList: [],
});
const recentOrders = ref([]);
const loading = ref(false);
const showLowStockModal = ref(false);

const fetchDashboardData = async () => {
  loading.value = true;
  try {
    const res = await api.get("/orders/stats");
    stats.value = res.data;
    recentOrders.value = res.data.recentOrders;
  } catch (err) {
    console.error("Lỗi tải dashboard:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDashboardData);

const formatMoney = (money) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    money || 0
  );
</script>

<template>
  <div v-if="loading" class="text-center py-5">
    <BSpinner label="Đang tải..." />
  </div>

  <div v-else>
    <BRow class="mb-4">
      <BCol md="3">
        <BCard no-body class="stat-card shadow-sm h-100 border-0 p-3">
          <div class="d-flex justify-content-between">
            <div>
              <h6 class="text-muted">Tổng Doanh Thu</h6>
              <h3 class="fw-bold text-success">
                {{ formatMoney(stats.revenueToday) }}
              </h3>
            </div>
            <div class="icon-box bg-success-subtle text-success">
              <i class="bi bi-currency-dollar"></i>
            </div>
          </div>
        </BCard>
      </BCol>

      <BCol md="3">
        <BCard no-body class="stat-card shadow-sm h-100 border-0 p-3">
          <div class="d-flex justify-content-between">
            <div>
              <h6 class="text-muted">Đơn Chờ Xử Lý</h6>
              <h3 class="fw-bold text-warning">{{ stats.pendingOrders }}</h3>
            </div>
            <div class="icon-box bg-warning-subtle text-warning">
              <i class="bi bi-clock-history"></i>
            </div>
          </div>
        </BCard>
      </BCol>

      <BCol md="3">
        <BCard no-body class="stat-card shadow-sm h-100 border-0 p-3">
          <div class="d-flex justify-content-between">
            <div>
              <h6 class="text-muted">Tổng Đơn Hoàn Thành</h6>
              <h3 class="fw-bold text-primary">{{ stats.completedToday }}</h3>
            </div>
            <div class="icon-box bg-primary-subtle text-primary">
              <i class="bi bi-check-circle"></i>
            </div>
          </div>
        </BCard>
      </BCol>

      <BCol md="3" @click="showLowStockModal = true" style="cursor: pointer">
        <BCard
          no-body
          class="stat-card shadow-sm h-100 border-0 p-3 low-stock-card"
        >
          <div class="d-flex justify-content-between">
            <div>
              <h6 class="text-muted">Hàng Sắp Hết</h6>
              <h3 class="fw-bold text-danger">{{ stats.lowStock }}</h3>
              <small class="text-danger fst-italic" v-if="stats.lowStock > 0"
                >(Nhấn để xem)</small
              >
            </div>
            <div class="icon-box bg-danger-subtle text-danger">
              <i class="bi bi-exclamation-triangle"></i>
            </div>
          </div>
        </BCard>
      </BCol>
    </BRow>

    <BCard title="Đơn Hàng Mới Nhất" class="shadow-sm border-0">
      <BTableSimple hover responsive>
        <thead class="table-light">
          <tr>
            <th>Mã Đơn</th>
            <th>Khách Hàng</th>
            <th>Tổng Tiền</th>
            <th>Trạng Thái</th>
            <th>Thời Gian</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in recentOrders" :key="order.ma_don_hang">
            <td>#{{ order.ma_don_hang }}</td>
            <td>{{ order.ho_ten }}</td>
            <td class="fw-bold">{{ formatMoney(order.tong_tien) }}</td>
            <td>
              <BBadge
                :variant="
                  order.trang_thai === 'Pending' ? 'warning' : 'success'
                "
              >
                {{ order.trang_thai }}
              </BBadge>
            </td>
            <td>{{ new Date(order.ngay_tao).toLocaleString() }}</td>
          </tr>
        </tbody>
      </BTableSimple>
    </BCard>

    <BModal
      v-model="showLowStockModal"
      title="Sản phẩm sắp hết hàng (Kho < 5)"
      hide-footer
    >
      <div v-if="stats.lowStockList && stats.lowStockList.length > 0">
        <BTableSimple hover bordered>
          <thead class="table-light">
            <tr>
              <th>Tên sản phẩm</th>
              <th class="text-center">Tồn kho</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in stats.lowStockList" :key="index">
              <td>{{ item.ten_san_pham }}</td>
              <td class="text-center fw-bold text-danger">
                {{ item.so_luong }}
              </td>
            </tr>
          </tbody>
        </BTableSimple>
      </div>
      <div v-else class="text-center text-success py-3">
        <i class="bi bi-check-circle fs-1"></i>
        <p class="mt-2">
          Kho hàng đang ổn định, không có sản phẩm nào sắp hết.
        </p>
      </div>
    </BModal>
  </div>
</template>

<style scoped>
.icon-box {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 1.5rem;
}
.bg-success-subtle {
  background-color: #d1e7dd;
}
.bg-warning-subtle {
  background-color: #fff3cd;
}
.bg-primary-subtle {
  background-color: #cfe2ff;
}
.bg-danger-subtle {
  background-color: #f8d7da;
}

.low-stock-card:hover {
  background-color: #fff5f5;
  transition: background-color 0.3s;
}
</style>
