import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user:null,
        loading:true,
        error:null
    },
    reducers:{
        setUser: (state,action)=>{
            state.user = action.payload;
        },
        setLoading: (state,action)=>{
            state.loading = action.payload;
        },
        setError: (state,action)=>{
            // Always store a string — prevents non-serializable AxiosError in store
            state.error = action.payload ? String(action.payload) : null;
        }
    }
})
export const {setUser,setLoading,setError} = authSlice.actions;
export default authSlice.reducer;