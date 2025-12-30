import api from "./axios";
export const getInventory = () => {
  return api.get("/inventory");
};
export const getAllIngredients = () => {
  return api.get("/inventory/ingredients");
};
export const restockItem = (id, amount) => {
  return api.post(`/inventory/${id}/restock`, { amount });
};
export const addInventoryItem = (data) => {
  return api.post("/inventory/add", data);
};
