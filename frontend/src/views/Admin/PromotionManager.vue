<script setup>
import { ref, onMounted } from "vue";
import {
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "../../api/promotion";

const promotions = ref([]);
const isEditing = ref(false);
const currentId = ref(null);
const form = ref({
  code: "",
  discount: 10,
  minOrder: 0,
  start: "",
  end: "",
  description: "",
});

const fetchPromotions = async () => {
  const res = await getAllPromotions();
  promotions.value = res.data;
};

// Hàm reset form về trạng thái thêm mới
const resetForm = () => {
  form.value = {
    code: "",
    discount: 10,
    minOrder: 0,
    start: "",
    end: "",
    description: "",
  };
  isEditing.value = false;
  currentId.value = null;
};

// Hàm xử lý khi bấm nút "Sửa"
const openEdit = (p) => {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toISOString().split("T")[0];
  };

  form.value = {
    code: p.ma_code,
    discount: p.giam_phan_tram,
    minOrder: p.don_toi_thieu,
    start: formatDate(p.ngay_bat_dau),
    end: formatDate(p.ngay_ket_thuc),
    description: p.mo_ta,
  };
  currentId.value = p.ma_khuyen_mai;
  isEditing.value = true;
};

// Hàm xử lý Xóa
const handleDelete = async (id) => {
  if (!confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) return;
  try {
    await deletePromotion(id);
    alert("Đã xóa!");
    fetchPromotions();
  } catch (err) {
    alert("Lỗi xóa: " + (err.response?.data || err.message));
  }
};

// Hàm Submit
const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      await updatePromotion(currentId.value, form.value);
      alert("Cập nhật thành công!");
    } else {
      await createPromotion(form.value);
      alert("Tạo mã thành công!");
    }
    fetchPromotions();
    resetForm();
  } catch (err) {
    alert("Lỗi: " + (err.response?.data || err.message));
  }
};

onMounted(fetchPromotions);
</script>

<template>
  <div class="p-4">
    <h2 class="mb-4">Quản Lý Mã Giảm Giá</h2>

    <BRow>
      <BCol md="4">
        <BCard
          :title="isEditing ? 'Cập nhật mã' : 'Tạo mã mới'"
          class="shadow-sm mb-4"
        >
          <BForm @submit.prevent="handleSubmit">
            <BFormGroup label="Mã Code (VD: SALE50)" class="mb-2">
              <BFormInput
                v-model="form.code"
                required
                style="text-transform: uppercase"
              />
            </BFormGroup>
            <BFormGroup label="Giảm (%)" class="mb-2">
              <BFormInput
                type="number"
                v-model="form.discount"
                min="1"
                max="100"
                required
              />
            </BFormGroup>
            <BFormGroup label="Đơn tối thiểu (VND)" class="mb-2">
              <BFormInput type="number" v-model="form.minOrder" />
            </BFormGroup>
            <BRow>
              <BCol
                ><BFormGroup label="Ngày bắt đầu"
                  ><BFormInput
                    type="date"
                    v-model="form.start"
                    required /></BFormGroup
              ></BCol>
              <BCol
                ><BFormGroup label="Ngày kết thúc"
                  ><BFormInput
                    type="date"
                    v-model="form.end"
                    required /></BFormGroup
              ></BCol>
            </BRow>

            <div class="d-flex gap-2 mt-3">
              <BButton type="submit" variant="primary" class="flex-grow-1">
                {{ isEditing ? "Lưu Thay Đổi" : "Tạo Mã" }}
              </BButton>
              <BButton v-if="isEditing" variant="secondary" @click="resetForm">
                Hủy
              </BButton>
            </div>
          </BForm>
        </BCard>
      </BCol>

      <BCol md="8">
        <BCard class="shadow-sm">
          <BTableSimple responsive hover>
            <thead class="table-light">
              <tr>
                <th>Mã</th>
                <th>Giảm</th>
                <th>Đơn tối thiểu</th>
                <th>Thời hạn</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in promotions" :key="p.ma_khuyen_mai">
                <td class="fw-bold text-primary">{{ p.ma_code }}</td>
                <td>
                  <BBadge variant="success">{{ p.giam_phan_tram }}%</BBadge>
                </td>
                <td>
                  {{ new Intl.NumberFormat("vi-VN").format(p.don_toi_thieu) }}đ
                </td>
                <td>
                  <small class="d-block text-muted">
                    {{ new Date(p.ngay_bat_dau).toLocaleDateString() }} -
                    {{ new Date(p.ngay_ket_thuc).toLocaleDateString() }}
                  </small>
                </td>
                <td>
                  <BButtonGroup size="sm">
                    <BButton variant="warning" @click="openEdit(p)">
                      <i class="bi bi-pencil-square"></i>
                    </BButton>
                    <BButton
                      variant="danger"
                      @click="handleDelete(p.ma_khuyen_mai)"
                    >
                      <i class="bi bi-trash"></i>
                    </BButton>
                  </BButtonGroup>
                </td>
              </tr>
            </tbody>
          </BTableSimple>
        </BCard>
      </BCol>
    </BRow>
  </div>
</template>
