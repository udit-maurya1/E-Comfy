/**
 * Presentation constants shared by the seller's order list and order detail
 * screens. The status colours match the buyer-side Orders page, so a status
 * reads the same on both sides of the counter.
 */
export const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Playfair+Display:ital,wght@0,400;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap";

export const STATUS_COLOR = {
  pending: "var(--text-muted)",
  confirmed: "#4ade80",
  shipped: "#60a5fa",
  delivered: "#4ade80",
  cancelled: "#ff6b6b",
};

export const PAYMENT_COLOR = {
  created: "var(--text-muted)",
  paid: "#4ade80",
  failed: "#ff6b6b",
  refunded: "#facc15",
};
