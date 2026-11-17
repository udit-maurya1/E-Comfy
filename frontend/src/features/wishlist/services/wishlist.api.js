import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api/wishlist",
  withCredentials: true,
});

export const getWishlist = async () => {
  try {
    const response = await axiosInstance.get("/");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const addToWishlist = async (productId, variantId) => {
  try {
    const response = await axiosInstance.post(`/${productId}`, { variantId });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const removeFromWishlist = async (productId) => {
  try {
    const response = await axiosInstance.delete(`/${productId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const mergeWishlist = async (items) => {
  try {
    const response = await axiosInstance.post("/merge", { items });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
