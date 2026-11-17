import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api/payment",
  withCredentials: true,
});

export const createPaymentOrder = async (addressId) => {
  try {
    const response = await axiosInstance.post("/order", { addressId });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const verifyPayment = async (payload) => {
  try {
    const response = await axiosInstance.post("/verify", payload);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const markPaymentFailed = async (razorpayOrderId, reason) => {
  try {
    const response = await axiosInstance.post("/failed", {
      razorpayOrderId,
      reason,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getOrders = async () => {
  try {
    const response = await axiosInstance.get("/orders");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
