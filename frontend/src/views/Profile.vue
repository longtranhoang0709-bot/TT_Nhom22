<script setup>
import { ref, onMounted } from "vue";
import userApi from "../api/user";

//state nguoi dung
const user = ref({
  email: "",
  ho_ten: "",
  so_dien_thoai: "",
  dia_chi: ""
});
const message = ref("");
const variant = ref("success");

//lay userId tu localStorage
const getUserId = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
        const u = JSON.parse(userStr);
        // DB của bạn trả về 'ma_nguoi_dung', fallback sang 'id' phòng hờ
        return u.ma_nguoi_dung || u.id;
    } catch (e) {
        return null;
    }
};

const userId = getUserId();
//lay thong tin nguoi dung
const fetchProfile = async () => {
  if (!userId) return; 
  try {
    const res = await userApi.getById(userId);
    user.value = res.data;
  } catch (err) {
    console.error(err);
    if(err.response && err.response.status === 401) {
       // Token hết hạn thì clear và đá về login
       localStorage.clear();
       window.location.href = '/login';
    }
  }
};

const handleUpdate = async () => {
  try {
    await userApi.update(userId, {
      ho_ten: user.value.ho_ten,
      so_dien_thoai: user.value.so_dien_thoai,
      dia_chi: user.value.dia_chi,
    });
    message.value = "Cập nhật thông tin thành công!";
    variant.value = "success";
    // Cập nhật lại localStorage
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (currentUser) {
        currentUser.ho_ten = user.value.ho_ten;
        localStorage.setItem("user", JSON.stringify(currentUser));
    }
    
  } catch (err) {
    message.value = "Lỗi: " + (err.response?.data || err.message);
    variant.value = "danger";
  }
};

// dổi mật khẩu
const passForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});
const passMessage = ref("");     
const passVariant = ref("success");

const handleChangePass = async () => {
  passMessage.value = "";
  
  if (passForm.value.newPassword !== passForm.value.confirmPassword) {
      passMessage.value = "Mật khẩu xác nhận không khớp!";
      passVariant.value = "danger";
      return;
  }

  try {
      await userApi.changePassword({
          oldPassword: passForm.value.oldPassword,
          newPassword: passForm.value.newPassword
      });
      
      passMessage.value = "Đổi mật khẩu thành công!";
      passVariant.value = "success";
      
      // Reset form
      passForm.value = { oldPassword: "", newPassword: "", confirmPassword: "" };
  } catch (err) {
      passMessage.value = err.response?.data || "Lỗi đổi mật khẩu, vui lòng kiểm tra lại mật khẩu cũ.";
      passVariant.value = "danger";
  }
};

onMounted(() => {
  if (!userId) {
    alert("Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại!");
    window.location.href = "/login";
  } else {
    fetchProfile();
  }
});
</script>

<template>
  <BContainer class="my-5 d-flex flex-column align-items-center gap-4">
    
    <BCard title="Hồ sơ cá nhân" class="shadow w-100" style="max-width: 600px">
      <BForm @submit.prevent="handleUpdate">
        <BFormGroup label="Email (Không thể sửa)" class="mb-3">
          <BFormInput :model-value="user.email" disabled />
        </BFormGroup>

        <BFormGroup label="Họ tên" class="mb-3">
          <BFormInput v-model="user.ho_ten" required />
        </BFormGroup>

        <BFormGroup label="Số điện thoại" class="mb-3">
          <BFormInput v-model="user.so_dien_thoai" />
        </BFormGroup>

        <BFormGroup label="Địa chỉ" class="mb-4">
          <BFormInput v-model="user.dia_chi" />
        </BFormGroup>

        <BAlert
          :model-value="!!message"
          :variant="variant"
          dismissible
          @close="message = ''"
        >
          {{ message }}
        </BAlert>

        <div class="d-flex justify-content-end">
          <BButton type="submit" variant="primary">Lưu thông tin</BButton>
        </div>
      </BForm>
    </BCard>

    <BCard title="Đổi mật khẩu" class="shadow w-100" style="max-width: 600px">
      <BForm @submit.prevent="handleChangePass">
        <BFormGroup label="Mật khẩu cũ" class="mb-3">
          <BFormInput v-model="passForm.oldPassword" type="password" required placeholder="Nhập mật khẩu hiện tại" />
        </BFormGroup>
        
        <BFormGroup label="Mật khẩu mới" class="mb-3">
          <BFormInput v-model="passForm.newPassword" type="password" required placeholder="Nhập mật khẩu mới" />
        </BFormGroup>
        
        <BFormGroup label="Xác nhận mật khẩu mới" class="mb-4">
          <BFormInput v-model="passForm.confirmPassword" type="password" required placeholder="Nhập lại mật khẩu mới" />
        </BFormGroup>

        <BAlert
          :model-value="!!passMessage"
          :variant="passVariant"
          dismissible
          @close="passMessage = ''"
        >
          {{ passMessage }}
        </BAlert>

        <div class="d-flex justify-content-end">
          <BButton type="submit" variant="warning">Đổi mật khẩu</BButton>
        </div>
      </BForm>
    </BCard>

  </BContainer>
</template>