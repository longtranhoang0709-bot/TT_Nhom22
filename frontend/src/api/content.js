import api from "./axios";
export const getBanners = () => api.get("/content/banners");
export const createBanner = (formData) => {
  return api.post("/content/banners", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const deleteBanner = (id) => api.delete(`/content/banners/${id}`);