import {
  createProduct,
  getSellerProducts,
  getAllProducts,
  getProductById,
  updateProduct,
  addProductVariant,
  updateVariantStock,
  deleteProductVariant,
} from "../service/product.api.js";
import { useDispatch } from "react-redux";
import { setSellerProducts ,setAllProducts,setTotalPages,setLoading,setCurrentProduct} from "../state/product.slice.js";

export const useProduct = () => {
  const dispatch = useDispatch();

  const createNewProduct = async (formData) => {
    try {
      const newProduct = await createProduct(formData);
      fetchSellerProducts(); // Refresh the seller's products after creating a new one
      return newProduct;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  };

  const fetchSellerProducts = async () => {
    try {
      const products = await getSellerProducts();
      dispatch(setSellerProducts(products));
    } catch (error) {
      console.error("Error fetching seller products:", error);
      throw error;
    }
  };

  const fetchAllProducts = async (page, limit=12) => {
    try {
      dispatch(setLoading(true));
      const products = await getAllProducts(page, limit);
      dispatch(setAllProducts(products.products));
      dispatch(setTotalPages(products.totalPages));
      dispatch(setLoading(false));
    } catch (error) {
      console.error("Error fetching all products:", error);
      dispatch(setLoading(false));
      throw error;
    }
  };

  const fetchProductById = async (id) => {
    try {
      dispatch(setLoading(true));
      const product = await getProductById(id);
      console.log(product)
      dispatch(setCurrentProduct(product));
      dispatch(setLoading(false));
    } catch (error) {
      console.error("Error fetching product by id:", error);
      dispatch(setLoading(false));
      throw error;
    }
  };

  const updateExistingProduct = async (id, productData) => {
    try {
      dispatch(setLoading(true));
      const updatedProduct = await updateProduct(id, productData);
      dispatch(setCurrentProduct(updatedProduct));
      dispatch(setLoading(false));
      return updatedProduct;
    } catch (error) {
      console.error("Error updating product:", error);
      dispatch(setLoading(false));
      throw error;
    }
  };

  const addVariantToProduct = async (id, formData) => {
    try {
      dispatch(setLoading(true));
      const updatedProduct = await addProductVariant(id, formData);
      dispatch(setCurrentProduct(updatedProduct));
      dispatch(setLoading(false));
      return updatedProduct;
    } catch (error) {
      console.error("Error adding variant:", error);
      dispatch(setLoading(false));
      throw error;
    }
  };

  // Stock edits are frequent and inline, so they deliberately skip the global
  // loading flag — flipping it would blank the panel the seller is typing in.
  const updateStockOfVariant = async (id, variantId, stock) => {
    try {
      const updatedProduct = await updateVariantStock(id, variantId, stock);
      dispatch(setCurrentProduct(updatedProduct));
      return updatedProduct;
    } catch (error) {
      console.error("Error updating variant stock:", error);
      throw error;
    }
  };

  const removeVariantFromProduct = async (id, variantId) => {
    try {
      const updatedProduct = await deleteProductVariant(id, variantId);
      dispatch(setCurrentProduct(updatedProduct));
      return updatedProduct;
    } catch (error) {
      console.error("Error deleting variant:", error);
      throw error;
    }
  };

  return {
    createNewProduct,
    fetchSellerProducts,
    fetchAllProducts,
    fetchProductById,
    updateExistingProduct,
    addVariantToProduct,
    updateStockOfVariant,
    removeVariantFromProduct,
  };
};

