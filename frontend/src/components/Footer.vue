<template>
  <footer class="footer-section">
    <BContainer>
      <BRow class="py-5">
        <BCol md="4" class="mb-4 mb-md-0 text-center text-md-start">
          <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-3">
             <div class="footer-logo-icon">
                <i class="bi bi-cup-hot-fill"></i>
             </div>
             <h4 class="fw-bold text-uppercase m-0 spacing-1">Cà Phê PL</h4>
          </div>
          <p class="text-white-50 small pe-md-5">
            Chế biến tách cà phê hoàn hảo từ năm 2020. Trải nghiệm sự ấm áp của nghệ thuật pha chế thủ công và không gian thư giãn tuyệt vời.
          </p>
        </BCol>

        <BCol md="4" class="mb-4 mb-md-0 text-center">
           <h5 class="fw-bold text-uppercase mb-4 title-underline">Giờ Mở Cửa</h5>
           <ul class="list-unstyled text-white-50">
             <li class="mb-2">Thứ 2 - Thứ 6: <strong>7:00 - 20:00</strong></li>
             <li>Thứ 7 - Chủ Nhật: <strong>8:00 - 21:00</strong></li>
           </ul>
        </BCol>

        <BCol md="4" class="text-center text-md-end">
           <h5 class="fw-bold text-uppercase mb-4 title-underline">Kết nối với chúng tôi</h5>
           <div class="d-flex gap-3 justify-content-center justify-content-md-end">
              <a href="#" class="social-icon"><i class="bi bi-facebook"></i></a>
              <a href="#" class="social-icon"><i class="bi bi-instagram"></i></a>
              <a href="#" class="social-icon"><i class="bi bi-twitter-x"></i></a>
           </div>
        </BCol>
      </BRow>

      <div class="border-top border-secondary py-4 text-center text-white-50 small">
         &copy; 2025 Cà Phê PL. All rights reserved.
      </div>
    </BContainer>
  </footer>
</template>

<style scoped>
.footer-section {
  background-color: #4E342E; 
  color: #fff;
  margin-top: auto;
}

.footer-logo-icon {
  width: 40px; height: 40px;
  background-color: #fff;
  color: #4E342E;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem;
}

.spacing-1 { letter-spacing: 1px; }

.social-icon {
  width: 45px; height: 45px;
  background-color: rgba(255,255,255,0.1);
  color: #fff;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  text-decoration: none;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255,255,255,0.1);
}

.social-icon:hover {
  background-color: #d4a574; 
  border-color: #d4a574;
  transform: translateY(-3px);
}

.title-underline {
    position: relative;
    display: inline-block;
}
</style>