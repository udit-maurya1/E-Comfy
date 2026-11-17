import product from "../models/product.model.js";

const getStockByProductAndVariant = async (productId, variantId) => {
  try {
    const productItem = await product.findById(productId);
    if (!productItem) {
      throw new Error("Product not found");
    }

    const variantItem = productItem.variant.id(variantId);
    if (!variantItem) {
      throw new Error("Variant not found");
    }

    return variantItem.stock;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default getStockByProductAndVariant;
