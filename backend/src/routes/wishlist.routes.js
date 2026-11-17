import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  mergeWishlist,
} from "../controllers/wishlist.controller.js";

const wishlistRouter = Router();

// Declared before /:productId so "merge" isn't swallowed as a product id.
wishlistRouter.post("/merge", authenticateUser, mergeWishlist);

wishlistRouter.get("/", authenticateUser, getWishlist);
wishlistRouter.post("/:productId", authenticateUser, addToWishlist);
wishlistRouter.delete("/:productId", authenticateUser, removeFromWishlist);

export default wishlistRouter;
