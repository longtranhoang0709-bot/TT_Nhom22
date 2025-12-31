<script setup>
import { ref, onMounted } from "vue";
import userApi from "../../api/user";

const listUsers = ref([]);
const error = ref("");
const loading = ref(false);

// State cho Modal
const showModal = ref(false);
const isEditing = ref(false);
const currentId = ref(null);

const form = ref({
  ho_ten: "",
  email: "",
  password: "",
  so_dien_thoai: "",
  role: "User",
});

const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await userApi.getAll();
    listUsers.value = res.data;
  } catch (err) {
    error.value = "Lỗi tải dữ liệu hoặc bạn không có quyền!";
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value = {
    ho_ten: "",
    email: "",
    password: "",
    so_dien_thoai: "",
    role: "User",
  };
  isEditing.value = false;
  currentId.value = null;
};

const openAddModal = () => {
  resetForm();
  showModal.value = true;
};

const openEditModal = (u) => {
  form.value = {
    ho_ten: u.ho_ten,
    email: u.email,
    so_dien_thoai: u.so_dien_thoai,
    role: u.ten_vai_tro || "User"
  };
  currentId.value = u.ma_nguoi_dung;
  isEditing.value = true;
  showModal.value = true;
};

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      const updateData = { ...form.value };
      delete updateData.password; // Không gửi password khi sửa thông tin chung

      await userApi.update(currentId.value, updateData);
      alert("Cập nhật thành công!");
    } else {
      await userApi.create(form.value);
      alert("Thêm người dùng thành công!");
    }
    showModal.value = false;
    fetchUsers();
  } catch (err) {
    alert("Lỗi: " + (err.response?.data?.message || err.message));
  }
};

const handleDelete = async (id) => {
  if (!confirm("Bạn muốn xóa người này? Hành động không thể hoàn tác!")) return;
  try {
    await userApi.delete(id);
    fetchUsers();
  } catch (err) {
    alert("Xóa thất bại!");
  }
};

onMounted(fetchUsers);
</script>

<template>
  <BContainer class="my-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Quản lý Khách hàng</h2>
      <BButton variant="success" @click="openAddModal">+ Thêm User</BButton>
    </div>

    <BAlert :model-value="!!error" variant="danger">{{ error }}</BAlert>

    <BCard class="shadow-sm">
      <BTableSimple hover responsive striped caption-top>
        <thead class="table-dark">
          <tr>
            <th>Họ tên</th>
            <th>Email</th>
            <th>SĐT</th>
            <th>Vai trò</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in listUsers" :key="u.ma_nguoi_dung || u._id">
            <td>
              <strong>{{ u.ho_ten }}</strong>
            </td>
            <td>{{ u.email }}</td>
            <td>{{ u.so_dien_thoai || "---" }}</td>
            <td>
              <BBadge variant="primary" v-if="u.roles?.includes('Admin')"
                >Admin</BBadge
              >
              <BBadge variant="secondary" v-else>User</BBadge>
            </td>
            <td>
              <BButtonGroup size="sm">
                <BButton variant="warning" @click="openEditModal(u)"
                  >Sửa</BButton
                >
                <BButton
                  variant="danger"
                  @click="handleDelete(u.ma_nguoi_dung || u._id)"
                  >Xóa</BButton
                >
              </BButtonGroup>
            </td>
          </tr>
        </tbody>
      </BTableSimple>
    </BCard>

    <BModal
      v-model="showModal"
      :title="isEditing ? 'Sửa thông tin User' : 'Thêm User mới'"
      @ok="handleSubmit"
      ok-title="Lưu"
      cancel-title="Hủy"
    >
      <BForm @submit.stop.prevent="handleSubmit">
        <BFormGroup label="Họ tên" class="mb-2">
          <BFormInput v-model="form.ho_ten" required />
        </BFormGroup>

        <BFormGroup label="Email" class="mb-2">
          <BFormInput
            v-model="form.email"
            type="email"
            required
            :disabled="isEditing"
          />
        </BFormGroup>

        <BFormGroup
          :label="
            isEditing ? 'Mật khẩu mới (Để trống nếu không đổi)' : 'Mật khẩu'
          "
          class="mb-2"
        >
          <BFormInput
            v-model="form.password"
            type="password"
            :required="!isEditing"
            placeholder="******"
          />
        </BFormGroup>

        <BFormGroup label="Số điện thoại" class="mb-2">
          <BFormInput v-model="form.so_dien_thoai" />
        </BFormGroup>

        <BFormGroup label="Vai trò" class="mb-2">
          <BFormSelect v-model="form.role">
            <option value="User">User (Khách hàng)</option>
            <option value="Admin">Admin (Quản trị)</option>
          </BFormSelect>
        </BFormGroup>
      </BForm>
      <template #footer="{ cancel }">
        <BButton variant="secondary" @click="cancel()">Hủy</BButton>
        <BButton variant="primary" @click="handleSubmit()">Lưu</BButton>
      </template>
    </BModal>
  </BContainer>
</template>
