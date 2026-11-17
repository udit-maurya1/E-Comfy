import { useDispatch, useSelector } from "react-redux";
import {
  setWishlist,
  setLoading,
  setError,
  setMerged,
} from "../state/wishlist.slice.js";
import {
  getWishlist as getWishlistApi,
  addToWishlist as addToWishlistApi,
  removeFromWishlist as removeFromWishlistApi,
  mergeWishlist as mergeWishlistApi,
} from "../services/wishlist.api.js";
import {
  readLocalWishlist,
  addToLocalWishlist,
  removeFromLocalWishlist,
  clearLocalWishlist,
  toMergePayload,
} from "../storage.js";

const messageFrom = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

/**
 * One wishlist API for the whole app. Whether an item lands in MongoDB or in
 * localStorage is decided here, by whether there's a signed-in user — callers
 * just say "toggle this product".
 */
export const useWishlist = () => {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const items = useSelector((s) => s.wishlist.items);
  const merged = useSelector((s) => s.wishlist.merged);

  const isSignedIn = Boolean(user);

  /** Reads whichever store is authoritative right now. */
  const loadWishlist = async () => {
    if (!isSignedIn) {
      dispatch(setWishlist(readLocalWishlist()));
      return;
    }

    dispatch(setLoading(true));
    try {
      const res = await getWishlistApi();
      dispatch(setWishlist(res.wishlist?.items || []));
    } catch (err) {
      dispatch(setError(messageFrom(err, "Failed to load your wishlist")));
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Pushes a guest's saved items onto their account, then empties the local
   * store so the two can't drift. Runs once per sign-in.
   */
  const mergeLocalWishlist = async () => {
    if (!isSignedIn || merged) return;

    const payload = toMergePayload();
    dispatch(setMerged(true));

    if (payload.length === 0) {
      await loadWishlist();
      return;
    }

    dispatch(setLoading(true));
    try {
      const res = await mergeWishlistApi(payload);
      dispatch(setWishlist(res.wishlist?.items || []));
      clearLocalWishlist();
    } catch (err) {
      // Keep the local copy on failure — losing saved items is worse than a
      // wishlist that merges on the next sign-in instead.
      dispatch(setMerged(false));
      dispatch(setError(messageFrom(err, "Couldn't sync your saved items")));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const isWishlisted = (productId) =>
    items.some((item) => item.product?._id === productId);

  const addItem = async (product, variantId) => {
    if (!isSignedIn) {
      dispatch(setWishlist(addToLocalWishlist(product, variantId)));
      return;
    }

    // Optimistic — a heart that lags behind the click feels broken.
    const previous = items;
    dispatch(setWishlist([{ product, variant: variantId }, ...items]));

    try {
      const res = await addToWishlistApi(product._id, variantId);
      dispatch(setWishlist(res.wishlist?.items || []));
    } catch (err) {
      dispatch(setWishlist(previous));
      dispatch(setError(messageFrom(err, "Failed to save to wishlist")));
    }
  };

  const removeItem = async (productId) => {
    if (!isSignedIn) {
      dispatch(setWishlist(removeFromLocalWishlist(productId)));
      return;
    }

    const previous = items;
    dispatch(
      setWishlist(items.filter((item) => item.product?._id !== productId)),
    );

    try {
      const res = await removeFromWishlistApi(productId);
      dispatch(setWishlist(res.wishlist?.items || []));
    } catch (err) {
      dispatch(setWishlist(previous));
      dispatch(setError(messageFrom(err, "Failed to remove from wishlist")));
    }
  };

  /** What the heart button calls. */
  const toggleItem = async (product, variantId) =>
    isWishlisted(product._id)
      ? removeItem(product._id)
      : addItem(product, variantId);

  return {
    loadWishlist,
    mergeLocalWishlist,
    toggleItem,
    addItem,
    removeItem,
    isWishlisted,
  };
};
