import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
  addToCart,
  getCartItems,
  removeFromCart,
  updateCartItemQuantity,
} from "../controllers/cart.controller.js";

const cartRouter = Router();

cartRouter.post("/add/:productId/:variantId", authenticateUser, addToCart);
cartRouter.get("/items", authenticateUser, getCartItems);
cartRouter.delete("/remove/:itemId", authenticateUser, removeFromCart);
cartRouter.put("/update/:itemId", authenticateUser, updateCartItemQuantity);

export default cartRouter;
