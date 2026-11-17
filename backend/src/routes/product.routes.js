import { Router } from "express";
import {
  authenticateSeller,
  authenticateUser,
} from "../middlewares/auth.middleware.js";
import {
  createProduct,
  getProductsBySeller,
  getAllProducts,
  getProductById,
  updateProduct,
  addProductVariant,
  updateVariantStock,
  deleteProductVariant,
} from "../controllers/product.controller.js";
import { createProductValidation } from "../validator/product.validator.js";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
}); // Limit file size to 5MB

const router = Router();

router.post(
  "/create",
  authenticateSeller,
  upload.array("images", 5),
  createProductValidation,

  createProduct,
);

router.get("/get-products-seller", authenticateSeller, getProductsBySeller);

// Public — no auth required
router.get("/all", getAllProducts);

router.get("/get-product/:id", authenticateUser, getProductById);

router.put("/update/:id", authenticateSeller, updateProduct);

router.post("/:id/variant", authenticateSeller, upload.array("images", 5), addProductVariant);

router.patch("/:id/variant/:variantId/stock", authenticateSeller, updateVariantStock);

router.delete("/:id/variant/:variantId", authenticateSeller, deleteProductVariant);

export default router;
