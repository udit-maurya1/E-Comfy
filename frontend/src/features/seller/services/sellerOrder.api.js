import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api/payment/seller",
  withCredentials: true,
});

export const getSellerOrders = async () => {
  try {
    const response = await axiosInstance.get("/orders");
    return response.data;
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    throw error;
  }
};

export const getSellerStats = async (days) => {
  try {
    const response = await axiosInstance.get("/stats", { params: { days } });
    return response.data;
  } catch (error) {
    console.error("Error fetching seller stats:", error);
    throw error;
  }
};

export const getSellerOrderById = async (orderId) => {
  try {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching seller order:", error);
    throw error;
  }
};
