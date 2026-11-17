import { createSlice } from "@reduxjs/toolkit";

const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [],
    // The order the buyer just placed — read by the success screen.
    currentOrder: null,
    // "idle" | "creating" | "processing" | "success" | "failed"
    // Drives the checkout button copy and blocks double submits.
    status: "idle",
    loading: false,
    error: null,
  },
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload ? String(action.payload) : null;
    },
    resetCheckout: (state) => {
      state.status = "idle";
      state.error = null;
      state.currentOrder = null;
    },
  },
});

export const {
  setOrders,
  setCurrentOrder,
  setStatus,
  setLoading,
  setError,
  resetCheckout,
} = orderSlice.actions;
export default orderSlice.reducer;
