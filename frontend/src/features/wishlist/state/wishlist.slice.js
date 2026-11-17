import { createSlice } from "@reduxjs/toolkit";

/**
 * Holds the wishlist in one shape regardless of where it came from — the server
 * for signed-in users, localStorage for guests. Items are always
 * `{ product, variant, addedAt }`, so the UI never branches on auth state.
 */
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
    error: null,
    // True once the guest list has been pushed to the account this session,
    // so a re-render can't fire the merge twice.
    merged: false,
  },
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload || [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload ? String(action.payload) : null;
    },
    setMerged: (state, action) => {
      state.merged = action.payload;
    },
  },
});

export const { setWishlist, setLoading, setError, setMerged } =
  wishlistSlice.actions;

// Cheap enough to call from every product card.
export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.items.some((item) => item.product?._id === productId);

export const selectWishlistCount = (state) => state.wishlist.items.length;

export default wishlistSlice.reducer;
