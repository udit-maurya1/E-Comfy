import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api/cart",
  credentials: true,
});

export const addToCart = async (productId, variantId, quantity = 1) => {
  try {
    const response = await axiosInstance.post(`/add/${productId}/${variantId}`, {
      quantity:quantity
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getCartItems = async () => {
  try {
    const response = await axiosInstance.get("/items");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateCartItemQuantity = async (itemId, quantity) => {
  try {
    const response = await axiosInstance.put(`/update/${itemId}`, {
      quantity: quantity,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const removeFromCart = async (ItemId) => {
  try {
    const response = await axiosInstance.delete(`/remove/${ItemId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};