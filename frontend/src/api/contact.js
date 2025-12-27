import api from "./axios";

export const submitContact = (data) => api.post("/contact", data);
export const getAllContacts = () => api.get("/contact");
export const deleteContact = (id) => api.delete(`/contact/${id}`);