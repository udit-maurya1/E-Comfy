import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api/address",
  withCredentials: true,
});

export const getAddresses = async () => {
  try {
    const response = await axiosInstance.get("/");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createAddress = async (address) => {
  try {
    const response = await axiosInstance.post("/", address);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateAddress = async (addressId, address) => {
  try {
    const response = await axiosInstance.put(`/${addressId}`, address);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteAddress = async (addressId) => {
  try {
    const response = await axiosInstance.delete(`/${addressId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const setDefaultAddress = async (addressId) => {
  try {
    const response = await axiosInstance.patch(`/${addressId}/default`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
