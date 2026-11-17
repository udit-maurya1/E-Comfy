import { createSlice } from "@reduxjs/toolkit";
import { EMPTY_AMOUNTS } from "../../checkout/pricing";

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [],
        totalPrice: 0,
        totalQuantity: 0,
        // Server-computed { subtotal, shipping, tax, total } — the storefront
        // displays these rather than recomputing the pricing rules itself.
        amounts: EMPTY_AMOUNTS,
        loading: false,
        error: null,
    },
    reducers: {
        setAmounts: (state, action) => {
            state.amounts = action.payload || EMPTY_AMOUNTS;
        },
        addToCart: (state, action) => {
            state.items = action.payload;
        },
        removeFromCart: (state, action) => {
            state.items = action.payload;
        },
        updateCartItemQuantity: (state, action) => {
            state.items = action.payload;
        },
        calculateTotalPrice: (state) => {
            state.totalPrice = state.items.reduce(
                (acc, item) => acc + (item.price?.amount || 0) * (item.quantity || 1),
                0
            );
        },
        calculateTotalQuantity: (state) => {
            state.totalQuantity = state.items.reduce(
                (acc, item) => acc + (item.quantity || 0),
                0
            );
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setCart: (state, action) => {
            state.items = action.payload;
        },
        // Signing out must not leave the previous shopper's basket on screen —
        // the badge would still be counting items the server no longer hands us.
        clearCart: (state) => {
            state.items = [];
            state.totalPrice = 0;
            state.totalQuantity = 0;
            state.amounts = EMPTY_AMOUNTS;
            state.error = null;
        },
    },
});
export const { addToCart, removeFromCart, updateCartItemQuantity, calculateTotalPrice, calculateTotalQuantity, setAmounts, setLoading, setError, setCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;