import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api/product",
  withCredentials: true,
});

export const createProduct = async (formData) => {
  try {
    const response = await axiosInstance.post("/create", formData);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const getSellerProducts = async () => {
  try {
    const response = await axiosInstance.get("/get-products-seller");
    return response.data;
  } catch (error) {
    console.error("Error fetching seller products:", error);
    throw error;
  }
};

export const getAllProducts = async (page, limit) => {
  try {
    const response = await axiosInstance.get("/all", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all products:", error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await axiosInstance.get(`/get-product/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product by id:", error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await axiosInstance.put(`/update/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const addProductVariant = async (id, formData) => {
  try {
    const response = await axiosInstance.post(`/${id}/variant`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding product variant:", error);
    throw error;
  }
};

export const updateVariantStock = async (id, variantId, stock) => {
  try {
    const response = await axiosInstance.patch(
      `/${id}/variant/${variantId}/stock`,
      { stock },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating variant stock:", error);
    throw error;
  }
};

export const deleteProductVariant = async (id, variantId) => {
  try {
    const response = await axiosInstance.delete(`/${id}/variant/${variantId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting product variant:", error);
    throw error;
  }
};

