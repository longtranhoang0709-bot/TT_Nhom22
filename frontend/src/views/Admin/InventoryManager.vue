<script setup>
import { ref, onMounted, reactive } from "vue";
import {
  getInventory,
  restockItem,
  addInventoryItem,
} from "../../api/inventory";
import {
  BRow,
  BCol,
  BCard,
  BCardBody,
  BButton,
  BModal,
  BSpinner,
} from "bootstrap-vue-next";

const items = ref([]);
const loading = ref(false);
const showAddModal = ref(false);

const newItem = reactive({
  ten_nguyen_lieu: "",
  don_vi_tinh: "kg",
  nha_cung_cap: "",
  so_luong: 0,
  dinh_muc_toi_thieu: 10,
  dinh_muc_toi_da: 1000,
});

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getInventory();
    items.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Thêm nguyên liệu mới
const handleAddNew = async () => {
  if (!newItem.ten_nguyen_lieu || !newItem.nha_cung_cap) {
    alert("Vui lòng điền tên và nhà cung cấp!");
    return;
  }

  try {
    await addInventoryItem(newItem);
    alert("Thêm thành công!");
    showAddModal.value = false;

    // Reset form
    Object.assign(newItem, {
      ten_nguyen_lieu: "",
      don_vi_tinh: "kg",
      nha_cung_cap: "",
      so_luong: 0,
      dinh_muc_toi_thieu: 10,
      dinh_muc_toi_da: 1000,
    });
    fetchData();
  } catch (err) {
    const msg =
      err.response?.data?.message || err.response?.data || err.message;
    alert("Lỗi khi thêm: " + msg);
  }
};

// Nhập kho
const handleRestock = async (item) => {
  const amount = prompt(
    `Nhập số lượng thêm cho ${item.ten_nguyen_lieu} (${item.don_vi_tinh}):`,
    10
  );
  if (amount && !isNaN(amount)) {
    try {
      await restockItem(item.ma_nguyen_lieu, parseFloat(amount));
      alert("Đã nhập kho!");
      fetchData();
    } catch (err) {
      alert("Lỗi nhập kho");
    }
  }
};

const getStatusColor = (qty, min) => {
  if (qty <= min / 2) return "danger";
  if (qty < min) return "warning";
  return "success";
};

onMounted(fetchData);
</script>

<template>
  <div class="p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold text-coffee m-0">Quản Lý Kho Nguyên Liệu</h2>
      <BButton variant="coffee" @click="showAddModal = true">
        <i class="bi bi-plus-lg"></i> Thêm Nguyên Liệu
      </BButton>
    </div>

    <div v-if="loading" class="text-center py-5">
      <BSpinner variant="primary"></BSpinner>
    </div>

    <BRow v-else class="g-4">
      <BCol md="6" xl="4" v-for="item in items" :key="item.ma_nguyen_lieu">
        <BCard no-body class="shadow-sm h-100 border-0">
          <div
            class="card-status-bar"
            :class="
              'bg-' + getStatusColor(item.so_luong, item.dinh_muc_toi_thieu)
            "
          ></div>

          <BCardBody class="p-4">
            <div class="d-flex justify-content-between mb-2">
              <h5 class="fw-bold text-coffee">{{ item.ten_nguyen_lieu }}</h5>
              <span
                class="badge"
                :class="
                  'bg-' + getStatusColor(item.so_luong, item.dinh_muc_toi_thieu)
                "
              >
                {{
                  item.so_luong < item.dinh_muc_toi_thieu
                    ? "Sắp hết"
                    : "Ổn định"
                }}
              </span>
            </div>

            <div class="text-muted small mb-3">
              NCC: {{ item.nha_cung_cap }}
            </div>

            <div class="d-flex justify-content-between align-items-end mb-2">
              <h2 class="fw-bold mb-0 text-primary">
                {{ item.so_luong }}
                <small class="fs-6 text-muted">{{ item.don_vi_tinh }}</small>
              </h2>
              <small>Min: {{ item.dinh_muc_toi_thieu }}</small>
            </div>

            <BButton
              variant="coffee"
              class="w-100 mt-2"
              @click="handleRestock(item)"
            >
              <i class="bi bi-box-arrow-in-down"></i> Nhập Thêm
            </BButton>
          </BCardBody>
        </BCard>
      </BCol>
    </BRow>

    <BModal
      v-model="showAddModal"
      title="Thêm Nguyên Liệu Mới"
      @ok="handleAddNew"
      ok-title="Lưu"
      cancel-title="Hủy"
    >
      <form @submit.prevent="handleAddNew">
        <div class="mb-3">
          <label class="form-label">Tên Nguyên Liệu</label>
          <input
            v-model="newItem.ten_nguyen_lieu"
            type="text"
            class="form-control"
            placeholder="Ví dụ: Đường phèn"
            required
          />
        </div>
        <div class="row g-2 mb-3">
          <div class="col-6">
            <label class="form-label">Đơn Vị Tính</label>
            <select v-model="newItem.don_vi_tinh" class="form-select">
              <option value="kg">kg</option>
              <option value="gram">gram</option>
              <option value="lít">lít</option>
              <option value="ml">ml</option>
              <option value="cái">cái</option>
              <option value="hộp">hộp</option>
            </select>
          </div>
          <div class="col-6">
            <label class="form-label">Nhà Cung Cấp</label>
            <input
              v-model="newItem.nha_cung_cap"
              type="text"
              class="form-control"
              placeholder="NCC A..."
            />
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Số Lượng Ban Đầu</label>
          <input
            v-model.number="newItem.so_luong"
            type="number"
            class="form-control"
          />
        </div>
        <div class="row g-2">
          <div class="col-6">
            <label class="form-label">Định mức tối thiểu</label>
            <input
              v-model.number="newItem.dinh_muc_toi_thieu"
              type="number"
              class="form-control"
            />
          </div>
          <div class="col-6">
            <label class="form-label">Định mức tối đa</label>
            <input
              v-model.number="newItem.dinh_muc_toi_da"
              type="number"
              class="form-control"
            />
          </div>
        </div>
      </form>
    </BModal>
  </div>
</template>

<style scoped>
.text-coffee {
  color: #4e342e;
}
.btn-coffee {
  background-color: #5d4037;
  color: white;
  border: none;
}
.btn-coffee:hover {
  background-color: #4e342e;
}
.card-status-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
}
</style>
