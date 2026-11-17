import { createSlice } from "@reduxjs/toolkit";

/**
 * Kept separate from the buyer's `order` slice: these are the same orders seen
 * from the other side of the counter, already filtered by the server to this
 * seller's lines, and the two lists must never overwrite each other.
 */
const sellerOrderSlice = createSlice({
  name: "sellerOrder",
  initialState: {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
    // Dashboard figures. Kept beside the orders they're derived from, with
    // their own loading flag so changing the date range never blanks the page.
    stats: null,
    statsLoading: false,
  },
  reducers: {
    setSellerOrders: (state, action) => {
      state.orders = action.payload;
    },
    setCurrentSellerOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    setSellerOrdersLoading: (state, action) => {
      state.loading = action.payload;
    },
    setSellerOrdersError: (state, action) => {
      state.error = action.payload ? String(action.payload) : null;
    },
    setSellerStats: (state, action) => {
      state.stats = action.payload;
    },
    setSellerStatsLoading: (state, action) => {
      state.statsLoading = action.payload;
    },
  },
});

export const {
  setSellerOrders,
  setCurrentSellerOrder,
  setSellerOrdersLoading,
  setSellerOrdersError,
  setSellerStats,
  setSellerStatsLoading,
} = sellerOrderSlice.actions;

export default sellerOrderSlice.reducer;
