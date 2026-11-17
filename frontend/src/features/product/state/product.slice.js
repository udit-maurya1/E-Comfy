import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
  name: "product",
  initialState: {
    sellerProducts: [],
    allProducts: [],
    totalPages: 1,
    currentPage: 1,
    loading: true,
    currentProduct: null,

  },
  reducers: {
    setSellerProducts: (state, action) => {
      state.sellerProducts = action.payload;
    },
    setAllProducts: (state, action) => {
      state.allProducts = action.payload;
    },
    setTotalPages: (state, action) => {
      state.totalPages = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setLoading: (state, action) => {
        state.loading = action.payload;
    },  
    setCurrentProduct: (state, action) => {
        state.currentProduct = action.payload;
    },
  },
});

export const { setSellerProducts,setAllProducts,setTotalPages,setCurrentPage,setLoading,setCurrentProduct } = productSlice.actions;

export default productSlice.reducer;
