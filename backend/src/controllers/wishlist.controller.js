import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Wishlist from "../models/wishlist.model.js";
import { getPopulatedWishlist } from "../dao/wishlist.dao.js";
import commerce from "../config/commerce.js";

/**
 * @desc get the logged-in user's wishlist
 * @route GET /api/wishlist
 * @access Private
 */
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await getPopulatedWishlist(req.user._id);
    return res.status(200).json({ wishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc add a product to the wishlist
 * @route POST /api/wishlist/:productId
 * @access Private
 */
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    // Optional — hearting from a catalogue card sends no variant.
    const { variantId } = req.body;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (variantId && !product.variant.id(variantId)) {
      return res.status(404).json({ message: "Variant not found" });
    }

    const wishlist =
      (await Wishlist.findOne({ user: userId })) ||
      new Wishlist({ user: userId, items: [] });

    const existing = wishlist.items.find(
      (item) => item.product.toString() === productId,
    );

    if (existing) {
      // Already hearted — hearting again from a product page just records the
      // variant they were looking at. Never a duplicate row.
      if (variantId) existing.variant = variantId;
    } else {
      if (wishlist.items.length >= commerce.MAX_WISHLIST_ITEMS) {
        return res.status(400).json({
          message: `Your wishlist is full (${commerce.MAX_WISHLIST_ITEMS} items)`,
        });
      }
      wishlist.items.unshift({ product: productId, variant: variantId });
    }

    await wishlist.save();
    const populated = await getPopulatedWishlist(userId);

    return res
      .status(200)
      .json({ message: "Added to wishlist", wishlist: populated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc remove a product from the wishlist
 * @route DELETE /api/wishlist/:productId
 * @access Private
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    const before = wishlist.items.length;
    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== productId,
    );

    if (wishlist.items.length === before) {
      return res.status(404).json({ message: "Product not in wishlist" });
    }

    await wishlist.save();
    const populated = await getPopulatedWishlist(userId);

    return res
      .status(200)
      .json({ message: "Removed from wishlist", wishlist: populated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc fold a signed-out browser's wishlist into the account's
 * @route POST /api/wishlist/merge
 * @access Private
 *
 * Called once right after sign-in. The union wins: nothing the buyer saved
 * while browsing as a guest is dropped, and nothing already on the account is
 * overwritten. Safe to call repeatedly — re-sending the same items is a no-op.
 */
export const mergeWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const incoming = Array.isArray(req.body?.items) ? req.body.items : [];

    const wishlist =
      (await Wishlist.findOne({ user: userId })) ||
      new Wishlist({ user: userId, items: [] });

    const seen = new Set(wishlist.items.map((item) => item.product.toString()));

    // Only ids that point at products that still exist get merged in.
    const candidateIds = incoming
      .map((item) => item?.productId)
      .filter((id) => mongoose.isValidObjectId(id) && !seen.has(String(id)));

    const liveProducts = await Product.find({
      _id: { $in: candidateIds },
    }).select("_id variant");

    const liveById = new Map(
      liveProducts.map((product) => [product._id.toString(), product]),
    );

    for (const item of incoming) {
      const productId = String(item?.productId || "");
      const product = liveById.get(productId);

      if (!product || seen.has(productId)) continue;
      if (wishlist.items.length >= commerce.MAX_WISHLIST_ITEMS) break;

      const variantId =
        item?.variantId && product.variant.id(item.variantId)
          ? item.variantId
          : undefined;

      wishlist.items.push({ product: productId, variant: variantId });
      seen.add(productId);
    }

    await wishlist.save();
    const populated = await getPopulatedWishlist(userId);

    return res
      .status(200)
      .json({ message: "Wishlist merged", wishlist: populated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
