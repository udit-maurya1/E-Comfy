/**
 * Display helpers only.
 *
 * Shipping, tax and totals are computed by the server and arrive on every cart
 * response as `cart.amounts` — there are deliberately no pricing constants
 * here, so the preview can never drift from the invoice. Store owners tune the
 * rules in backend/src/config/commerce.js.
 */
export const CURRENCY_SYMBOL = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

export const fmt = (n, currency = "INR") =>
  `${CURRENCY_SYMBOL[currency] || "₹"}${Number(n || 0).toLocaleString("en-IN")}`;

// What the cart slice holds before the first server response lands.
export const EMPTY_AMOUNTS = { subtotal: 0, shipping: 0, tax: 0, total: 0 };
