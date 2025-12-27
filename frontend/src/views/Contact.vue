<script setup>
import { ref } from "vue";
import { submitContact } from "../api/contact";

const form = ref({
  name: "",
  email: "",
  message: "",
});
const loading = ref(false);

const handleSubmit = async () => {
  loading.value = true;
  try {
    await submitContact(form.value);
    alert("Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn.");
    form.value = { name: "", email: "", message: "" }; 
  } catch (err) {
    alert("Lỗi: " + (err.response?.data || err.message));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="contact-page">
    <div class="header-section text-center py-5">
      <h1 class="display-4 fw-bold text-coffee">Liên Hệ</h1>
      <p class="text-muted lead">
        Chúng tôi rất mong được nghe từ bạn. Ghé thăm để thưởng thức một ly hoặc
        gửi tin nhắn cho chúng tôi!
      </p>
    </div>

    <BContainer class="pb-5">
      <BRow>
        <BCol md="6" class="mb-4">
          <BCard class="h-100 border-0 shadow-sm p-4 card-form">
            <h3 class="mb-4 text-coffee">Gửi Tin Nhắn Cho Chúng Tôi</h3>
            <BForm @submit.prevent="handleSubmit">
              <BFormGroup label="Tên Của Bạn" class="mb-3">
                <BFormInput
                  v-model="form.name"
                  required
                  placeholder="Nhập tên..."
                  class="bg-light border-0 py-2"
                />
              </BFormGroup>
              <BFormGroup label="Địa Chỉ Email" class="mb-3">
                <BFormInput
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="example@email.com"
                  class="bg-light border-0 py-2"
                />
              </BFormGroup>
              <BFormGroup label="Tin Nhắn" class="mb-4">
                <BFormTextarea
                  v-model="form.message"
                  rows="5"
                  required
                  placeholder="Nhập nội dung..."
                  class="bg-light border-0"
                />
              </BFormGroup>
              <BButton
                type="submit"
                variant="brown"
                class="w-100 py-2 text-white fw-bold"
                :disabled="loading"
              >
                {{ loading ? "Đang gửi..." : "Gửi Tin Nhắn" }}
              </BButton>
            </BForm>
          </BCard>
        </BCol>

        <BCol md="6">
          <div class="d-flex flex-column gap-3">
            <BCard
              class="border-0 shadow-sm info-card d-flex flex-row align-items-center"
            >
              <div class="icon-circle me-4">
                <i class="bi bi-geo-alt-fill"></i>
              </div>
              <div>
                <h5 class="fw-bold text-coffee">Ghé Thăm</h5>
                <p class="mb-0 text-muted">
                  Quận 8, Thành phố Hồ Chí Minh, Việt Nam
                </p>
              </div>
            </BCard>

            <BCard
              class="border-0 shadow-sm info-card d-flex flex-row align-items-center"
            >
              <div class="icon-circle me-4">
                <i class="bi bi-telephone-fill"></i>
              </div>
              <div>
                <h5 class="fw-bold text-coffee">Gọi Điện</h5>
                <p class="mb-0 text-muted">
                  (028) 3123-4567<br />Thứ 2-6: 9:00 - 18:00
                </p>
              </div>
            </BCard>

            <BCard
              class="border-0 shadow-sm info-card d-flex flex-row align-items-center"
            >
              <div class="icon-circle me-4">
                <i class="bi bi-envelope-fill"></i>
              </div>
              <div>
                <h5 class="fw-bold text-coffee">Email</h5>
                <p class="mb-0 text-muted">
                  admin@caphepl.com<br />Phản hồi trong vòng 24 giờ
                </p>
              </div>
            </BCard>

            <BCard
              class="border-0 shadow-sm info-card d-flex flex-row align-items-center"
            >
              <div class="icon-circle me-4">
                <i class="bi bi-clock-fill"></i>
              </div>
              <div>
                <h5 class="fw-bold text-coffee">Giờ Mở Cửa</h5>
                <p class="mb-0 text-muted">
                  Thứ 2 - Thứ 6: 7:00 - 20:00<br />Thứ 7 - CN: 8:00 - 21:00
                </p>
              </div>
            </BCard>
          </div>
        </BCol>
      </BRow>
    </BContainer>
  </div>
</template>

<style scoped>
.contact-page {
  background-color: #fffbf2;
  min-height: 100vh;
}
.text-coffee {
  color: #4e342e;
}
.btn-brown {
  background-color: #8d6e63;
  border: none;
}
.btn-brown:hover {
  background-color: #6d4c41;
}

.info-card {
  padding: 1.5rem;
  transition: transform 0.3s;
}
.info-card:hover {
  transform: translateY(-5px);
}

.icon-circle {
  width: 50px;
  height: 50px;
  background-color: #efebe9;
  color: #4e342e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}
</style>
