import Product from "../models/product.model.js";
import { uploadImage } from "../services/stroage.service.js";

export const createProduct = async (req, res) => {
  try {
    const { title, description, priceAmount, priceCurrency } = req.body;
    const sellerId = req.user._id; // Assuming the authenticated user's ID is available in req.user

    // Parse attributes Map of strings if provided
    let attributes = {};
    if (typeof req.body.attributes === "string") {
      try {
        attributes = JSON.parse(req.body.attributes);
      } catch (err) {
        console.error("Failed to parse attributes JSON:", err);
      }
    } else if (req.body.attributes) {
      attributes = req.body.attributes;
    }

    // Handle image upload if images are provided
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadImage(file.buffer, file.originalname);
        images.push({ url: uploadResult.url });
      }
    }

    const newProduct = new Product({
      title,
      description,
      attributes,
      seller: sellerId,
      price: {
        amount: priceAmount,
        currency: priceCurrency || "INR",
      },
      images,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProductsBySeller = async (req, res) => {
  try {
    const sellerId = req.user._id; // Assuming the authenticated user's ID is available in req.user
    const products = await Product.find({ seller: sellerId });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 12);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("seller", "fullname"),
      Product.countDocuments(),
    ]);

    res.status(200).json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching all products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching product with ID:", id);
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priceAmount, priceCurrency } = req.body;
    const sellerId = req.user._id;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== sellerId.toString()) {
      return res.status(403).json({ message: "Forbidden: You do not own this product" });
    }

    // Parse attributes Map of strings if provided
    let attributes = undefined;
    if (typeof req.body.attributes === "string") {
      try {
        attributes = JSON.parse(req.body.attributes);
      } catch (err) {
        console.error("Failed to parse attributes JSON:", err);
      }
    } else if (req.body.attributes !== undefined) {
      attributes = req.body.attributes;
    }

    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (attributes !== undefined) product.attributes = attributes;
    if (priceAmount !== undefined) {
      product.price = {
        amount: Number(priceAmount),
        currency: priceCurrency || product.price.currency || "INR",
      };
    } else if (priceCurrency !== undefined) {
      product.price.currency = priceCurrency;
    }

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Loads a product the caller is allowed to edit, or writes the failure response
 * and returns null. Every variant mutation runs the same three checks, so they
 * live here once.
 */
const loadOwnedProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return null;
  }

  if (product.seller.toString() !== req.user._id.toString()) {
    res.status(403).json({ message: "Forbidden: You do not own this product" });
    return null;
  }

  return product;
};

export const addProductVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user._id;
    const { priceAmount, priceCurrency, stock } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== sellerId.toString()) {
      return res.status(403).json({ message: "Forbidden: You do not own this product" });
    }

    // Handle variant image uploads (multiple files supported)
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadImage(file.buffer, file.originalname);
        images.push({ url: uploadResult.url });
      }
    }

    // Parse attributes Map of strings
    let attributes = {};
    if (typeof req.body.attributes === "string") {
      try {
        attributes = JSON.parse(req.body.attributes);
      } catch (err) {
        console.error("Failed to parse attributes JSON:", err);
      }
    } else if (req.body.attributes) {
      attributes = req.body.attributes;
    }

    const newVariant = {
      images,
      price: {
        amount: priceAmount ? Number(priceAmount) : 0,
        currency: priceCurrency || "INR",
      },
      attributes,
      stock: stock ? Number(stock) : 0,
    };

    product.variant.push(newVariant);
    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error adding product variant:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc adjust the stock level of one variant — stock is the only field a
 *       restock is allowed to touch, so price and attributes stay stable for
 *       carts and orders already referencing this variant
 * @route PATCH /api/product/:id/variant/:variantId/stock
 * @access Seller (owner only)
 */
export const updateVariantStock = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { stock } = req.body;

    const parsedStock = Number(stock);
    if (
      stock === undefined ||
      stock === null ||
      stock === "" ||
      !Number.isInteger(parsedStock) ||
      parsedStock < 0
    ) {
      return res
        .status(400)
        .json({ message: "Stock must be a whole number of 0 or more" });
    }

    const product = await loadOwnedProduct(req, res);
    if (!product) return;

    const variant = product.variant.id(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    variant.stock = parsedStock;
    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating variant stock:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc remove a variant from a product
 * @route DELETE /api/product/:id/variant/:variantId
 * @access Seller (owner only)
 *
 * Orders keep their own snapshot of what was bought, so deleting a variant here
 * never rewrites fulfilment history — it only takes the option off sale.
 */
export const deleteProductVariant = async (req, res) => {
  try {
    const { variantId } = req.params;

    const product = await loadOwnedProduct(req, res);
    if (!product) return;

    const variant = product.variant.id(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    product.variant.pull({ _id: variantId });
    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error deleting product variant:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

