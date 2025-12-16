<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios'; 

const orders = ref([]);
const loading = ref(false);

//1. thống kê số lượng đơn hàng theo trạng thái
const statusStats = ref([
  { key: 'Pending', label: 'Chờ Xử Lý', count: 0, icon: 'bi-clock', color: 'warning' },
  { key: 'Confirmed', label: 'Đang Chuẩn Bị', count: 0, icon: 'bi-box-seam', color: 'primary' },
  { key: 'Shipping', label: 'Sẵn Sàng/Giao', count: 0, icon: 'bi-check-circle', color: 'info' },
  { key: 'Completed', label: 'Hoàn Thành', count: 0, icon: 'bi-check2-all', color: 'success' },
]);

const fetchOrders = async () => {
  loading.value = true;
  try {
    const res = await api.get('/orders'); 
    orders.value = res.data;
    calculateStats();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

//2. Tính toán số lượng đơn hàng theo trạng thái
const calculateStats = () => {
    statusStats.value.forEach(s => s.count = 0);
    orders.value.forEach(order => {
        const stat = statusStats.value.find(s => s.key === order.trang_thai);
        if (stat) {
            stat.count++;
        }
    });
};

const updateStatus = async (id, status) => {
    try {
        await api.put(`/orders/${id}/status`, { status });
        fetchOrders();
    } catch(err) {
        alert("Lỗi cập nhật: " + (err.response?.data?.error || err.message));
    }
}

onMounted(fetchOrders);

const formatMoney = (money) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(money);
</script>

<template>
  <div>
    <h2 class="fw-bold text-coffee mb-4">Quản Lý Đơn Hàng</h2>

    <BRow class="mb-4">
      <BCol md="3" v-for="stat in statusStats" :key="stat.label">
        <BCard no-body class="border-0 shadow-sm p-3 d-flex flex-row align-items-center h-100">
            <div :class="`me-3 text-${stat.color} fs-1`">
                <i :class="['bi', stat.icon]"></i>
            </div>
            <div>
                <h6 class="text-muted mb-1">{{ stat.label }}</h6>
                <h3 class="fw-bold mb-0">{{ stat.count }}</h3>
            </div>
        </BCard>
      </BCol>
    </BRow>

    <div v-if="loading" class="text-center py-5">
        <BSpinner variant="primary" label="Đang tải..." />
    </div>

    <div v-else>
        <BCard v-for="order in orders" :key="order.ma_don_hang" no-body class="mb-3 shadow-sm border-0 order-card">
            <BCardBody>
                <div class="d-flex justify-content-between align-items-start flex-wrap">
                    <div>
                        <h5 class="fw-bold text-coffee d-flex align-items-center gap-2">
                            #ORD-{{ order.ma_don_hang }} 
                            <BBadge :variant="getStatusVariant(order.trang_thai)">
                                {{ order.trang_thai }}
                            </BBadge>
                        </h5>
                        <div class="text-muted mb-1">
                            <i class="bi bi-person-circle me-2"></i> 
                            Khách hàng: <span class="fw-bold text-dark">{{ order.ho_ten }}</span>
                        </div>
                        <div class="text-muted mb-1">
                             <i class="bi bi-geo-alt-fill me-2"></i> 
                             {{ order.dia_chi_giao }} - {{ order.so_dien_thoai }}
                        </div>
                        <div class="mt-2 text-secondary fst-italic bg-light p-2 rounded" v-if="order.ghi_chu">
                            "{{ order.ghi_chu }}"
                        </div>
                    </div>

                    <div class="text-end mt-2 mt-md-0">
                        <h4 class="fw-bold text-danger mb-3">{{ formatMoney(order.tong_tien) }}</h4>
                        <div class="text-muted small mb-3">
                            {{ new Date(order.ngay_tao).toLocaleString() }}
                        </div>
                        
                        <div class="d-flex gap-2 justify-content-end">
                            <BButton 
                                v-if="order.trang_thai === 'Pending'" 
                                size="sm" variant="primary" 
                                @click="updateStatus(order.ma_don_hang, 'Confirmed')"
                            >
                                <i class="bi bi-check-lg"></i> Xác Nhận & Làm Món
                            </BButton>

                            <BButton 
                                v-if="order.trang_thai === 'Confirmed'" 
                                size="sm" variant="info" class="text-white"
                                @click="updateStatus(order.ma_don_hang, 'Shipping')"
                            >
                                <i class="bi bi-truck"></i> Báo Giao Hàng
                            </BButton>

                            <BButton 
                                v-if="order.trang_thai === 'Shipping'" 
                                size="sm" variant="success" 
                                @click="updateStatus(order.ma_don_hang, 'Completed')"
                            >
                                <i class="bi bi-check2-all"></i> Hoàn Thành
                            </BButton>
                        </div>
                    </div>
                </div>
            </BCardBody>
        </BCard>
        
        <div v-if="orders.length === 0" class="text-center text-muted py-5">
            Không có đơn hàng nào.
        </div>
    </div>
  </div>
</template>

<style scoped>
.text-coffee { color: #4E342E; }
.order-card { 
    transition: transform 0.2s; 
    border-left: 5px solid transparent !important;
}
.order-card:hover { 
    border-left: 5px solid #4E342E !important; 
    transform: translateX(5px);
}
</style>

<script>
function getStatusVariant(status) {
    switch(status) {
        case 'Pending': return 'warning';
        case 'Confirmed': return 'primary';
        case 'Shipping': return 'info';
        case 'Completed': return 'success';
        case 'Cancelled': return 'danger';
        default: return 'secondary';
    }
}
</script>