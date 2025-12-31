<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../../api/axios";
import { adminCancelOrder, getOrderDetail } from "../../api/order";

const orders = ref([]);
const loading = ref(false);
const detailModal = ref(false);
const selectedOrder = ref(null);

// 1. FILTER & SEARCH STATE
const searchQuery = ref("");
const filterStatus = ref("All");

// STATS DATA
const statusStats = ref([
  {
    key: "Pending",
    label: "Chờ Xử Lý",
    count: 0,
    icon: "bi-clock",
    color: "warning",
  },
  {
    key: "Confirmed",
    label: "Đang Chuẩn Bị",
    count: 0,
    icon: "bi-box-seam",
    color: "primary",
  },
  {
    key: "Shipping",
    label: "Giao Hàng",
    count: 0,
    icon: "bi-truck",
    color: "info",
  },
  {
    key: "Completed",
    label: "Hoàn Thành",
    count: 0,
    icon: "bi-check2-all",
    color: "success",
  },
  {
    key: "Cancelled",
    label: "Đã Hủy",
    count: 0,
    icon: "bi-x-circle",
    color: "danger",
  },
]);

//FETCH DATA
const fetchOrders = async () => {
  loading.value = true;
  try {
    const res = await api.get("/orders");
    orders.value = res.data;
    calculateStats();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const calculateStats = () => {
  statusStats.value.forEach((s) => (s.count = 0));
  orders.value.forEach((order) => {
    const stat = statusStats.value.find((s) => s.key === order.trang_thai);
    if (stat) stat.count++;
  });
};

// COMPUTED: FILTER LOGIC
const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    // 1. Lọc theo trạng thái
    const matchStatus =
      filterStatus.value === "All" || order.trang_thai === filterStatus.value;

    // 2. Tìm kiếm (Mã đơn hoặc Tên khách)
    const query = searchQuery.value.toLowerCase();
    const matchSearch =
      order.ma_don_hang.toString().includes(query) ||
      (order.ho_ten && order.ho_ten.toLowerCase().includes(query));

    return matchStatus && matchSearch;
  });
});

// ACTIONS
const updateStatus = async (id, status) => {
  try {
    await api.put(`/orders/${id}/status`, { status });
    fetchOrders();
  } catch (err) {
    alert("Lỗi: " + err.message);
  }
};

// Admin hủy đơn
const handleCancel = async (id) => {
  if (!confirm("Xác nhận hủy đơn này? Nguyên liệu sẽ được hoàn về kho."))
    return;
  try {
    await adminCancelOrder(id);
    alert("Đã hủy đơn hàng!");
    fetchOrders();
  } catch (err) {
    alert("Lỗi hủy đơn: " + (err.response?.data || err.message));
  }
};

// Xem chi tiết & In
const viewDetail = async (orderId) => {
  try {
    const res = await getOrderDetail(orderId);
    selectedOrder.value = res.data;
    detailModal.value = true;
  } catch (err) {
    alert("Không tải được chi tiết đơn hàng");
  }
};

const printInvoice = () => {
  if (!selectedOrder.value) return;

  // Tạo nội dung in
  const printContent = document.getElementById("invoice-content").innerHTML;
  const win = window.open("", "", "height=700,width=500");
  win.document.write("<html><head><title>Hóa Đơn - Cà Phê PL</title>");
  win.document.write(
    '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">'
  );
  win.document.write("</head><body>");
  win.document.write(printContent);
  win.document.write("</body></html>");
  win.document.close();
  win.print();
};

const formatMoney = (money) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    money
  );
const formatDate = (date) => new Date(date).toLocaleString("vi-VN");

onMounted(fetchOrders);
</script>

<template>
  <div>
    <h2 class="fw-bold text-coffee mb-4">Quản Lý Đơn Hàng</h2>

    <BRow class="mb-4">
      <BCol md="2" v-for="stat in statusStats" :key="stat.key" class="mb-2">
        <div
          class="p-2 border rounded text-center shadow-sm cursor-pointer stat-box"
          :class="{ 'active-filter': filterStatus === stat.key }"
          @click="filterStatus = stat.key"
          style="cursor: pointer; transition: 0.2s"
        >
          <h4 class="mb-0" :class="`text-${stat.color}`">{{ stat.count }}</h4>
          <small class="text-muted">{{ stat.label }}</small>
        </div>
      </BCol>
      <BCol md="2" class="mb-2">
        <div
          class="p-2 border rounded text-center shadow-sm stat-box"
          :class="{ 'active-filter': filterStatus === 'All' }"
          @click="filterStatus = 'All'"
          style="cursor: pointer"
        >
          <h4 class="mb-0 text-dark">{{ orders.length }}</h4>
          <small class="text-muted">Tất cả</small>
        </div>
      </BCol>
    </BRow>

    <div class="d-flex gap-3 mb-4 flex-wrap">
      <div class="flex-grow-1">
        <BInputGroup>
          <BInputGroupText><i class="bi bi-search"></i></BInputGroupText>
          <BFormInput
            v-model="searchQuery"
            placeholder="Tìm theo Mã đơn hoặc Tên khách hàng..."
          />
        </BInputGroup>
      </div>
      <div style="min-width: 200px">
        <BFormSelect v-model="filterStatus">
          <option value="All">Tất cả trạng thái</option>
          <option v-for="s in statusStats" :key="s.key" :value="s.key">
            {{ s.label }}
          </option>
        </BFormSelect>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <BSpinner variant="primary" label="Đang tải..." />
    </div>

    <div v-else>
      <BCard
        v-for="order in filteredOrders"
        :key="order.ma_don_hang"
        no-body
        class="mb-3 shadow-sm border-0 order-card"
      >
        <BCardBody>
          <div
            class="d-flex justify-content-between align-items-start flex-wrap"
          >
            <div>
              <h5 class="fw-bold text-coffee d-flex align-items-center gap-2">
                #{{ order.ma_don_hang }}
                <BBadge :variant="getStatusVariant(order.trang_thai)">{{
                  order.trang_thai
                }}</BBadge>
              </h5>
              <div class="text-muted mb-1">
                <i class="bi bi-person-circle me-2"></i>
                <span class="fw-bold text-dark">{{ order.ho_ten }}</span>
              </div>
              <div class="text-muted mb-1 small">
                <i class="bi bi-clock me-1"></i>
                {{ formatDate(order.ngay_tao) }}
              </div>
            </div>

            <div class="text-end mt-2 mt-md-0">
              <h4 class="fw-bold text-danger mb-2">
                {{ formatMoney(order.tong_tien) }}
              </h4>

              <div class="d-flex gap-2 justify-content-end flex-wrap">
                <BButton
                  size="sm"
                  variant="outline-secondary"
                  @click="viewDetail(order.ma_don_hang)"
                >
                  <i class="bi bi-eye"></i> Chi tiết
                </BButton>

                <BButton
                  v-if="order.trang_thai === 'Pending'"
                  size="sm"
                  variant="primary"
                  @click="updateStatus(order.ma_don_hang, 'Confirmed')"
                >
                  <i class="bi bi-check-lg"></i> Duyệt
                </BButton>

                <BButton
                  v-if="order.trang_thai === 'Confirmed'"
                  size="sm"
                  variant="info"
                  class="text-white"
                  @click="updateStatus(order.ma_don_hang, 'Shipping')"
                >
                  <i class="bi bi-truck"></i> Giao
                </BButton>

                <BButton
                  v-if="order.trang_thai === 'Shipping'"
                  size="sm"
                  variant="success"
                  @click="updateStatus(order.ma_don_hang, 'Completed')"
                >
                  <i class="bi bi-check2-all"></i> Xong
                </BButton>

                <BButton
                  v-if="
                    ['Pending', 'Confirmed', 'Shipping'].includes(
                      order.trang_thai
                    )
                  "
                  size="sm"
                  variant="danger"
                  @click="handleCancel(order.ma_don_hang)"
                >
                  <i class="bi bi-x-lg"></i> Hủy
                </BButton>
              </div>
            </div>
          </div>
        </BCardBody>
      </BCard>

      <div
        v-if="filteredOrders.length === 0"
        class="text-center text-muted py-5"
      >
        Không tìm thấy đơn hàng nào.
      </div>
    </div>

    <BModal
      v-model="detailModal"
      size="lg"
      title="Chi Tiết Đơn Hàng"
      hide-footer
    >
      <div v-if="selectedOrder" id="invoice-content" class="p-3">
        <div class="text-center mb-4 border-bottom pb-3">
          <h3 class="fw-bold text-uppercase">Cà Phê PL</h3>
          <p class="mb-1">Quận 8, TP.HCM</p>
          <p class="small text-muted">Hotline: (028) 3123-4567</p>
          <h5 class="fw-bold mt-3">HÓA ĐƠN BÁN LẺ</h5>
          <small>Mã đơn: #{{ selectedOrder.ma_don_hang }}</small> <br />
          <small>Ngày: {{ formatDate(selectedOrder.ngay_tao) }}</small>
        </div>

        <div class="mb-3">
          <p class="mb-1">
            <strong>Khách hàng:</strong> {{ selectedOrder.ho_ten }}
          </p>
          <p class="mb-1">
            <strong>SĐT:</strong> {{ selectedOrder.so_dien_thoai }}
          </p>
          <p class="mb-1">
            <strong>Địa chỉ:</strong> {{ selectedOrder.dia_chi_giao }}
          </p>
          <p class="mb-1" v-if="selectedOrder.ghi_chu">
            <strong>Ghi chú:</strong> {{ selectedOrder.ghi_chu }}
          </p>
        </div>

        <table class="table table-bordered table-sm">
          <thead class="table-light">
            <tr>
              <th>Tên món</th>
              <th class="text-center">SL</th>
              <th class="text-end">Đơn giá</th>
              <th class="text-end">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in selectedOrder.items" :key="idx">
              <td>{{ item.ten_san_pham }}</td>
              <td class="text-center">{{ item.so_luong }}</td>
              <td class="text-end">{{ formatMoney(item.don_gia) }}</td>
              <td class="text-end">
                {{ formatMoney(item.don_gia * item.so_luong) }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="text-end fw-bold">Tổng tiền hàng:</td>
              <td class="text-end">
                {{
                  formatMoney(
                    selectedOrder.tong_tien + (selectedOrder.tien_giam_gia || 0)
                  )
                }}
              </td>
            </tr>
            <tr v-if="selectedOrder.tien_giam_gia > 0">
              <td colspan="3" class="text-end text-success">
                Giảm giá (Coupon):
              </td>
              <td class="text-end text-success">
                -{{ formatMoney(selectedOrder.tien_giam_gia) }}
              </td>
            </tr>
            <tr>
              <td colspan="3" class="text-end fw-bold fs-5">THANH TOÁN:</td>
              <td class="text-end fw-bold fs-5">
                {{ formatMoney(selectedOrder.tong_tien) }}
              </td>
            </tr>
          </tfoot>
        </table>

        <div class="text-center mt-4 pt-3 border-top fst-italic text-muted">
          Cảm ơn quý khách và hẹn gặp lại!
        </div>
      </div>

      <div class="d-flex justify-content-end gap-2 p-3 border-top bg-light">
        <BButton variant="secondary" @click="detailModal = false">Đóng</BButton>
        <BButton variant="dark" @click="printInvoice">
          <i class="bi bi-printer"></i> In Hóa Đơn
        </BButton>
      </div>
    </BModal>
  </div>
</template>

<script>
// Hàm helper ngoài setup để dùng trong template dễ dàng
function getStatusVariant(status) {
  switch (status) {
    case "Pending":
      return "warning";
    case "Confirmed":
      return "primary";
    case "Shipping":
      return "info";
    case "Completed":
      return "success";
    case "Cancelled":
      return "danger";
    default:
      return "secondary";
  }
}
</script>

<style scoped>
.text-coffee {
  color: #4e342e;
}
.stat-box {
  background: white;
  border: 1px solid #dee2e6;
}
.stat-box:hover {
  background-color: #f8f9fa;
}
.active-filter {
  border-color: #4e342e !important;
  background-color: #efebe9 !important;
}
.order-card {
  transition: transform 0.2s;
  border-left: 5px solid transparent !important;
}
.order-card:hover {
  border-left: 5px solid #4e342e !important;
  transform: translateX(5px);
}
</style>
