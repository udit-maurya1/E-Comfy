import './App.css'
import { RouterProvider } from 'react-router'
import { router } from './app.routes'
import { useAuth } from '../features/auth/hooks/useAuth'
import { useCart } from '../features/cart/hooks/useCart'
import { useWishlist } from '../features/wishlist/hooks/useWishlist'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

function App() {

  const {handleGetCurrentUser} = useAuth();
  const {getCartItems} = useCart();
  const {loadWishlist, mergeLocalWishlist} = useWishlist();
  const user = useSelector((s) => s.auth.user);
  const authLoading = useSelector((s) => s.auth.loading);

  useEffect(() => {
    handleGetCurrentUser();
    getCartItems();
  }, [])

  // The wishlist follows whoever is signed in. Once /auth/me settles: a signed-in
  // visitor gets their guest items folded into their account (mergeLocalWishlist
  // no-ops after the first run), a signed-out one reads localStorage. Doing it
  // here covers login, register, Google OAuth and plain refresh alike.
  useEffect(() => {
    if (authLoading) return;
    if (user) {
      mergeLocalWishlist();
    } else {
      loadWishlist();
    }
  }, [user, authLoading])

  return (
    <>
    <RouterProvider router={router}/>
    </>
  )
}

export default App
