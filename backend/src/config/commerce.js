/**
 * Storefront commerce rules — every number a store owner would want to tune
 * lives here instead of being hardcoded across controllers and components.
 * Override any of these from the environment without touching code.
 */
const commerce = {
  // Currency all orders are charged in. Must exist in price.schema.js enum.
  CURRENCY: process.env.CURRENCY || "INR",

  // Flat shipping fee applied when the cart is below the free-shipping bar.
  SHIPPING_FEE: Number(process.env.SHIPPING_FEE ?? 99),

  // Cart subtotal at (or above) which shipping is waived.
  FREE_SHIPPING_THRESHOLD: Number(process.env.FREE_SHIPPING_THRESHOLD ?? 999),

  // Tax applied on the subtotal, as a fraction (0.18 = 18% GST).
  // Default 0 — prices in this store are already tax-inclusive.
  TAX_RATE: Number(process.env.TAX_RATE ?? 0),

  // Max addresses a single user may keep in their address book.
  MAX_ADDRESSES_PER_USER: Number(process.env.MAX_ADDRESSES_PER_USER ?? 10),

  // Max products a wishlist may hold. Also caps what a guest browser can push
  // up at sign-in, so a tampered localStorage can't grow the document forever.
  MAX_WISHLIST_ITEMS: Number(process.env.MAX_WISHLIST_ITEMS ?? 100),

  // Which calendar a sales day belongs to. Bucketing in UTC would move an
  // evening order in India into the next day's takings.
  TIMEZONE: process.env.STORE_TIMEZONE || "Asia/Kolkata",

  // Stock at or below this shows up as a restock warning on the seller
  // dashboard, while there is still time to act on it.
  LOW_STOCK_THRESHOLD: Number(process.env.LOW_STOCK_THRESHOLD ?? 5),
};

/**
 * Turns a cart subtotal into the full amount breakdown charged to the buyer.
 * Single source of truth — the payment controller and the order document both
 * read from here, so the buyer can never be charged a number the UI invented.
 */
export const calculateOrderAmounts = (subtotal) => {
  // An empty cart costs nothing — never quote a shipping fee on zero goods.
  const shipping =
    subtotal <= 0 || subtotal >= commerce.FREE_SHIPPING_THRESHOLD
      ? 0
      : commerce.SHIPPING_FEE;
  const tax = Math.round(subtotal * commerce.TAX_RATE);
  const total = subtotal + shipping + tax;

  return {
    subtotal,
    shipping,
    tax,
    total,
    // Echoed so the storefront can render "spend X more for free shipping"
    // without hardcoding the rule it's describing.
    freeShippingThreshold: commerce.FREE_SHIPPING_THRESHOLD,
  };
};

export default commerce;
