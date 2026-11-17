import {createBrowserRouter} from "react-router";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import AuthCallback from "../features/auth/pages/AuthCallback";
import AddSellerProduct from "../features/product/pages/AddSellerProduct";
import SellerProduct from "../features/product/pages/SellerProduct";
import Protected from "../features/auth/components/Protected";
import Home from "../features/product/pages/Home";
import ProductDetail from "../features/product/pages/ProductDetail";
import SellerProductDetail from "../features/product/pages/SellerProductDetail";
import {ProtectedUser} from "../features/auth/components/Protected"
import Cart from "../features/cart/pages/Cart";
import Checkout from "../features/checkout/pages/Checkout";
import OrderSuccess from "../features/checkout/pages/OrderSuccess";
import Orders from "../features/checkout/pages/Orders";
import Wishlist from "../features/wishlist/pages/Wishlist";
import SellerDashboard from "../features/seller/pages/SellerDashboard";
import SellerOrders from "../features/seller/pages/SellerOrders";
import SellerOrderDetail from "../features/seller/pages/SellerOrderDetail";

export const router = createBrowserRouter([
    {
        path:"/",
        element:<Home/>,
    },
    {
        path:"/product/:id",
        element:<ProtectedUser><ProductDetail/></ProtectedUser>,
    },
    {
        path:"/cart",
        element:<ProtectedUser><Cart/></ProtectedUser>,
    },
    {
        // Deliberately public — guests keep a wishlist in localStorage.
        path:"/wishlist",
        element:<Wishlist/>,
    },
    {
        path:"/checkout",
        element:<ProtectedUser><Checkout/></ProtectedUser>,
    },
    {
        path:"/order/:orderId",
        element:<ProtectedUser><OrderSuccess/></ProtectedUser>,
    },
    {
        path:"/orders",
        element:<ProtectedUser><Orders/></ProtectedUser>,
    },
    {
        path:"/register",
        element:<Register/>
    },
    {
        path:"/login",
        element:<Login/>
    },
    {
        // Handles the redirect from backend after Google OAuth
        path:"/auth/callback",
        element:<AuthCallback/>
    },
    {
        path:"/seller/add-product",
        element:
        <Protected role="seller">
            <AddSellerProduct/>
        </Protected>
    },
    {
        path:"/seller/products",
        element:
        <Protected role="seller">
            <SellerProduct/>
        </Protected>
    },
    {
        path:"/seller/product/:id",
        element:
        <Protected role="seller">
            <SellerProductDetail/>
        </Protected>
    },
    {
        path:"/seller/dashboard",
        element:
        <Protected role="seller">
            <SellerDashboard/>
        </Protected>
    },
    {
        path:"/seller/orders",
        element:
        <Protected role="seller">
            <SellerOrders/>
        </Protected>
    },
    {
        path:"/seller/orders/:orderId",
        element:
        <Protected role="seller">
            <SellerOrderDetail/>
        </Protected>
    }
])