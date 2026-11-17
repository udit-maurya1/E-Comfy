import Wishlist from "../models/wishlist.model.js";

/**
 * Loads a user's wishlist with each item's product filled in, creating an empty
 * one on first access so callers never have to handle a missing document.
 *
 * Unlike the cart this uses populate rather than an aggregation — a wishlist has
 * no totals to compute, and the storefront wants the whole product (every
 * variant included) so it can render prices and a size picker.
 */
export const getPopulatedWishlist = async (userId) => {
  const wishlist =
    (await Wishlist.findOne({ user: userId })) ||
    (await new Wishlist({ user: userId, items: [] }).save());

  await wishlist.populate("items.product");

  // A product deleted by its seller leaves a dangling reference. Drop those
  // rather than shipping nulls to the client.
  const live = wishlist.items.filter((item) => item.product);
  if (live.length !== wishlist.items.length) {
    wishlist.items = live;
    await wishlist.save();
    await wishlist.populate("items.product");
  }

  return wishlist;
};

export default getPopulatedWishlist;
