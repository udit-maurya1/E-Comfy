import Cart from "../models/cart.model.js";
import { calculateOrderAmounts } from "../config/commerce.js";

/**
 * Joins each cart item to its product and the exact variant it points at, then
 * rolls the line items up into a single cart document with a server-computed
 * `total`. Checkout reads the same pipeline the cart screen does, so the amount
 * charged always matches the amount shown.
 */
export const getCartPipeline = (userId) => [
  {
    $match: {
      user: userId,
    },
  },
  { $unwind: { path: "$items" } },
  {
    $lookup: {
      from: "products",
      localField: "items.product",
      foreignField: "_id",
      as: "items.product",
    },
  },
  { $unwind: { path: "$items.product" } },
  {
    $unwind: { path: "$items.product.variant" },
  },
  {
    $match: {
      $expr: {
        $eq: ["$items.product.variant._id", "$items.variant"],
      },
    },
  },
  {
    $addFields: {
      totalPrice: {
        $multiply: ["$items.quantity", "$items.product.variant.price.amount"],
      },
    },
  },
  {
    $group: {
      _id: "$_id",
      items: { $push: "$items" },
      user: { $first: "$user" },
      total: { $sum: "$totalPrice" },
    },
  },
];

/**
 * Attaches the shipping/tax/total breakdown to a cart.
 *
 * Every cart response carries this, so the storefront never has to reimplement
 * the pricing rules — it renders whatever the server says the order costs, and
 * checkout charges that same number.
 */
export const withAmounts = (cart) => ({
  ...cart,
  amounts: calculateOrderAmounts(cart?.total || 0),
});

/**
 * Runs the pipeline and returns the single aggregated cart with its amounts, or
 * undefined when the user has no cart or every line item resolved to a dead
 * product/variant.
 */
export const getAggregatedCart = async (userId) => {
  const [cart] = await Cart.aggregate(getCartPipeline(userId));
  return cart ? withAmounts(cart) : undefined;
};

/**
 * The response shape for a user whose cart exists but has nothing in it.
 */
export const emptyCart = (cartId, userId) =>
  withAmounts({ _id: cartId, user: userId, items: [], total: 0 });

export default getCartPipeline;
