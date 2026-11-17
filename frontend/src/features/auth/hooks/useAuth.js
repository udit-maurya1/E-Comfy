import { useDispatch } from "react-redux";
import { setUser,setError,setLoading } from "../state/auth.slice";
import { register,login,getCurrentUser,logout } from "../servise/auth.api";
import { clearCart } from "../../cart/state/cart.slice";
import { setWishlist, setMerged } from "../../wishlist/state/wishlist.slice";

export const useAuth = () => {
    const dispatch = useDispatch();
    const handleRegister = async({email,contact,password,fullname,isSeller=false})=>{
        try {
            dispatch(setLoading(true));
            const response = await register({email,contact,password,fullname,isSeller});
            dispatch(setUser(response.user));
            dispatch(setLoading(false));
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Registration failed";
            dispatch(setError(errorMessage));
            dispatch(setLoading(false));
        }
    }
    const handleLogin = async({email,password})=>{
        try {
            dispatch(setLoading(true));
            const response = await login({email,password});
            dispatch(setUser(response.user));
            dispatch(setLoading(false));
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Login failed";
            dispatch(setError(errorMessage));
            dispatch(setLoading(false));
        }
    }

    const handleGetCurrentUser = async()=>{
        try {
            dispatch(setLoading(true));
            const response = await getCurrentUser();
            dispatch(setUser(response.user));
            dispatch(setLoading(false));
            return response.user;   
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to get current user";
            dispatch(setError(errorMessage));
            dispatch(setLoading(false));
        }
    }
    
    /**
     * Ends the session. The server clears the cookie and revokes the token in
     * Redis; the client drops every trace of the previous shopper — cart badge,
     * wishlist and the merge flag, so the next sign-in folds guest items in again.
     *
     * Local state is cleared even if the request failed: someone who clicked
     * "log out" must never be left looking at their own account.
     */
    const handleLogout = async()=>{
        try {
            await logout();
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Logout failed";
            dispatch(setError(errorMessage));
            return false;
        } finally {
            dispatch(setUser(null));
            dispatch(clearCart());
            dispatch(setWishlist([]));
            dispatch(setMerged(false));
        }
    }

    return {handleRegister,handleLogin,handleGetCurrentUser,handleLogout};
}
