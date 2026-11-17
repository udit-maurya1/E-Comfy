import { useDispatch } from "react-redux";
import { addToCart, removeFromCart, updateCartItemQuantity, calculateTotalPrice, calculateTotalQuantity, setAmounts, setLoading, setError, setCart } from "../state/cart.slice.js";
import { addToCart as addToCartApi, updateCartItemQuantity as updateCartItemApi, getCartItems as getCartItemsApi, removeFromCart as removeFromCartApi } from "../services/cart.api.js";

export const useCart = () => {
    const dispatch = useDispatch();

    // item = { productId, variantId, quantity }
    const addItemToCart = async (productId, variantId, quantity = 1) => {
        dispatch(setLoading(true));
        try {
            const res = await addToCartApi(productId, variantId, quantity);
            dispatch(addToCart(res.cart?.items || []));
            dispatch(setAmounts(res.cart?.amounts));
            dispatch(calculateTotalPrice());
            dispatch(calculateTotalQuantity());
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Failed to add item to cart";
            dispatch(setError(msg));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const removeItemFromCart = async (itemId) => {
        dispatch(setLoading(true));
        try {
            const res = await removeFromCartApi(itemId);
            dispatch(removeFromCart(res.cart?.items || []));
            dispatch(setAmounts(res.cart?.amounts));
            dispatch(calculateTotalPrice());
            dispatch(calculateTotalQuantity());
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Failed to remove item";
            dispatch(setError(msg));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    };

    const updateCartItem = async (itemId, quantity) => {
        dispatch(setLoading(true));
        try {
            const res = await updateCartItemApi(itemId, quantity);
            dispatch(updateCartItemQuantity(res.cart?.items || []));
            dispatch(setAmounts(res.cart?.amounts));
            dispatch(calculateTotalPrice());
            dispatch(calculateTotalQuantity());
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Failed to update quantity";
            dispatch(setError(msg));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    };

    const getCartItems = async () => {
        dispatch(setLoading(true));
        try {
            const res = await getCartItemsApi();
            dispatch(setCart(res.cart?.items || []));
            dispatch(setAmounts(res.cart?.amounts));
            dispatch(calculateTotalPrice());
            dispatch(calculateTotalQuantity());
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Failed to load cart";
            dispatch(setError(msg));
        } finally {
            dispatch(setLoading(false));
        }
    };

    return {
        addItemToCart,
        removeItemFromCart,
        updateCartItem,
        getCartItems,
    };
};