import api from "./axios";

export const getTopReviews = () => api.get("/reviews/top");
export const getAllReviews = () => api.get("/reviews");
export const createReview = (data) => api.post("/reviews", data);