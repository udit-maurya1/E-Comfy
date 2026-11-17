/**
 * The signed-out wishlist.
 *
 * A guest has no account to hang a wishlist off, so it lives in localStorage
 * until they sign in — at which point useWishlist pushes it to /api/wishlist/merge
 * and clears this store. Because there's no server to ask, each entry carries a
 * small snapshot of the product (title, image, price) so the wishlist page can
 * render without a lookup.
 */
const KEY = "ecomfy.wishlist.v1";

// Mirrors MAX_WISHLIST_ITEMS in backend/src/config/commerce.js.
const MAX_ITEMS = 100;

/**
 * localStorage throws in private-browsing modes and when the quota is full, and
 * a wishlist is never worth breaking the page over — every access is guarded.
 */
const safeRead = () => {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const safeWrite = (items) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    // Full or unavailable — the in-memory Redux copy still works for this session.
  }
};

/**
 * Trims a product down to what the wishlist page needs to draw a card.
 */
const snapshot = (product, variantId) => {
  const variant = variantId
    ? product.variant?.find((v) => v._id === variantId)
    : undefined;
  const images = variant?.images?.length ? variant.images : product.images;

  return {
    _id: product._id,
    title: product.title,
    images: images?.slice(0, 1) || [],
    price: variant?.price || product.price,
  };
};

export const readLocalWishlist = () => safeRead();

export const isInLocalWishlist = (productId) =>
  safeRead().some((item) => item.product?._id === productId);

export const addToLocalWishlist = (product, variantId) => {
  const items = safeRead();
  const existing = items.find((item) => item.product?._id === product._id);

  if (existing) {
    if (variantId) existing.variant = variantId;
  } else {
    items.unshift({
      product: snapshot(product, variantId),
      variant: variantId,
      addedAt: new Date().toISOString(),
    });
  }

  safeWrite(items);
  return items;
};

export const removeFromLocalWishlist = (productId) => {
  const items = safeRead().filter((item) => item.product?._id !== productId);
  safeWrite(items);
  return items;
};

export const clearLocalWishlist = () => {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to do — see safeWrite.
  }
};

/**
 * The id-only form the merge endpoint accepts. Snapshots stay local; the server
 * re-reads the real products.
 */
export const toMergePayload = () =>
  safeRead()
    .filter((item) => item.product?._id)
    .map((item) => ({
      productId: item.product._id,
      variantId: item.variant,
    }));
