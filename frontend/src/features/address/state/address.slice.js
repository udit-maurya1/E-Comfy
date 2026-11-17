import { createSlice } from "@reduxjs/toolkit";

const addressSlice = createSlice({
  name: "address",
  initialState: {
    addresses: [],
    // The address the buyer has picked for the order they're placing now.
    selectedAddressId: null,
    loading: false,
    error: null,
  },
  reducers: {
    setAddresses: (state, action) => {
      state.addresses = action.payload;
      // Keep a valid selection at all times: honour the existing pick if it
      // still exists, otherwise fall back to the default address.
      const stillExists = state.addresses.some(
        (a) => a._id === state.selectedAddressId,
      );
      if (!stillExists) {
        const fallback =
          state.addresses.find((a) => a.isDefault) || state.addresses[0];
        state.selectedAddressId = fallback?._id || null;
      }
    },
    addAddress: (state, action) => {
      state.addresses.unshift(action.payload);
      // A freshly added address is what the buyer means to ship to.
      state.selectedAddressId = action.payload._id;
    },
    updateAddress: (state, action) => {
      const index = state.addresses.findIndex(
        (a) => a._id === action.payload._id,
      );
      if (index > -1) {
        state.addresses[index] = action.payload;
      }
    },
    removeAddress: (state, action) => {
      state.addresses = state.addresses.filter((a) => a._id !== action.payload);
      if (state.selectedAddressId === action.payload) {
        const fallback =
          state.addresses.find((a) => a.isDefault) || state.addresses[0];
        state.selectedAddressId = fallback?._id || null;
      }
    },
    markDefault: (state, action) => {
      state.addresses = state.addresses.map((a) => ({
        ...a,
        isDefault: a._id === action.payload,
      }));
    },
    selectAddress: (state, action) => {
      state.selectedAddressId = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload ? String(action.payload) : null;
    },
  },
});

export const {
  setAddresses,
  addAddress,
  updateAddress,
  removeAddress,
  markDefault,
  selectAddress,
  setLoading,
  setError,
} = addressSlice.actions;
export default addressSlice.reducer;
