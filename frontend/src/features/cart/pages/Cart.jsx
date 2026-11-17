import { useEffect, useRef, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router";
import { gsap } from "gsap";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import { useCart } from "../hooks/useCart";
import { setError } from "../state/cart.slice";
import StoreNav from "../../../components/StoreNav";
import { fmt } from "../../checkout/pricing";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap";

// ── Icon Components ───────────────────────────────────────────────────
function CartEmptyIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" stroke="rgba(245,197,24,0.25)" strokeWidth="1.2">
      <path d="M6 6h7l9.5 42h32l7-28H18" strokeLinecap="square" />
      <circle cx="30" cy="62" r="4" />
      <circle cx="52" cy="62" r="4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" strokeLinecap="square" />
      <path d="M19 6l-1 14H6L5 6" strokeLinecap="square" />
      <path d="M10 11v6M14 11v6" strokeLinecap="square" />
      <path d="M9 6V4h6v2" strokeLinecap="square" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="9 18 15 12 9 6" strokeLinecap="square" />
    </svg>
  );
}

// ── Qty Button ─────────────────────────────────────────────────────────
function QtyButton({ label, onClick }) {
  const ref = useRef(null);
  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => gsap.to(ref.current, { borderColor: "#F5C518", color: "#F5C518", duration: 0.15 })}
      onMouseLeave={() => gsap.to(ref.current, { borderColor: "rgba(229,226,225,0.18)", color: "#e5e2e1", duration: 0.15 })}
      style={{
        width: "36px", height: "36px", background: "transparent",
        border: "1px solid rgba(229,226,225,0.18)", color: "#e5e2e1",
        fontSize: "18px", cursor: "pointer", outline: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
        transition: "border-color 0.15s, color 0.15s",
      }}
    >{label}</button>
  );
}

// ── Cart Item Row ──────────────────────────────────────────────────────
function CartItemRow({ item, onRemove, onUpdateQty, loading, isMobile }) {
  const rowRef = useRef(null);
  const removeRef = useRef(null);

  const productTitle = item.product?.title || "Product";
  const variantAttrs = item.product?.variant;
  const attrString = variantAttrs?.attributes
    ? Object.entries(
        variantAttrs.attributes instanceof Map
          ? Object.fromEntries(variantAttrs.attributes)
          : variantAttrs.attributes
      )
        .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
        .join(" | ")
    : null;

  const thumbnailImages = variantAttrs?.images?.length
    ? variantAttrs.images
    : item.product?.images || [];
  const thumb = thumbnailImages[0]?.url || null;

  const priceAmount = item.price?.amount || 0;
  const priceCurrency = item.price?.currency || "INR";

  const handleRemove = () => {
    gsap.to(rowRef.current, {
      opacity: 0, x: -40, height: 0, marginBottom: 0, padding: 0,
      duration: 0.35, ease: "power2.in",
      onComplete: () => onRemove(item._id),
    });
  };

  return (
    <div
      ref={rowRef}
      style={{
        display: "flex", alignItems: "flex-start", gap: isMobile ? "12px" : "24px",
        padding: "24px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      {/* Thumbnail */}
      <div style={{ flexShrink: 0, width: isMobile ? "76px" : "96px", height: isMobile ? "96px" : "120px", background: "#141414", border: "1px solid rgba(245,197,24,0.08)", overflow: "hidden" }}>
        {thumb
          ? <img src={thumb} alt={productTitle} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(245,197,24,0.2)" strokeWidth="0.8">
                <rect x="3" y="3" width="18" height="18" rx="1" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )
        }
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: isMobile ? "13px" : "15px", letterSpacing: "-0.01em", textTransform: "uppercase", color: "var(--text-color)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {productTitle}
        </h3>
        {attrString && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", color: "var(--accent-color)", margin: 0, textTransform: "uppercase" }}>
            {attrString}
          </p>
        )}
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: isMobile ? "16px" : "18px", color: "var(--accent-color)", margin: 0 }}>
          {fmt(priceAmount * item.quantity, priceCurrency)}
        </p>

        {/* Qty + Remove */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "4px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <QtyButton
              label="−"
              onClick={() => item.quantity > 1 ? onUpdateQty(item._id, item.quantity - 1) : handleRemove()}
            />
            <div style={{
              width: "44px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "14px", color: "#fff",
              borderTop: "1px solid rgba(229,226,225,0.18)", borderBottom: "1px solid rgba(229,226,225,0.18)",
            }}>
              {loading ? "·" : item.quantity}
            </div>
            <QtyButton label="+" onClick={() => onUpdateQty(item._id, item.quantity + 1)} />
          </div>

          <button
            ref={removeRef}
            onClick={handleRemove}
            onMouseEnter={() => gsap.to(removeRef.current, { color: "#ff6b6b", duration: 0.15 })}
            onMouseLeave={() => gsap.to(removeRef.current, { color: "rgba(229,226,225,0.3)", duration: 0.15 })}
            style={{ background: "transparent", border: "none", color: "rgba(229,226,225,0.3)", cursor: "pointer", padding: "0 4px", display: "flex", alignItems: "center", gap: "5px", fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            <TrashIcon /> Remove
          </button>
        </div>
      </div>

      {/* Per-unit price (desktop only) */}
      {!isMobile && (
        <div style={{ flexShrink: 0, textAlign: "right" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "rgba(229,226,225,0.35)", margin: "0 0 4px 0", letterSpacing: "0.08em", textTransform: "uppercase" }}>Unit</p>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "14px", color: "rgba(229,226,225,0.6)", margin: 0 }}>
            {fmt(priceAmount, priceCurrency)}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Order Summary ──────────────────────────────────────────────────────
function OrderSummary({ items, amounts, onCheckout, isMobile }) {
  const panelRef = useRef(null);
  const btnRef = useRef(null);

  // Shipping and total come from the server with the cart, so this panel and
  // the amount Razorpay charges can never disagree.
  const { subtotal, shipping, tax, total } = amounts;
  const currency = items[0]?.price?.currency || "INR";

  useEffect(() => {
    // Only animate y-position, never opacity — opacity stuck at 0 causes invisible panels
    gsap.fromTo(
      panelRef.current,
      { y: 20 },
      { y: 0, duration: 0.55, ease: "power2.out", delay: 0.2, clearProps: "transform" }
    );
  }, []);

  const handleCheckout = () => {
    gsap.timeline()
      .to(btnRef.current, { scale: 0.97, duration: 0.1, ease: "power2.in" })
      .to(btnRef.current, { scale: 1, duration: 0.25, ease: "back.out(2)" });
    if (onCheckout) onCheckout();
  };

  return (
    <div
      ref={panelRef}
      style={{
        opacity: 1,
        background: "var(--surface-color)", border: "1px solid var(--surface-border)",
        padding: "32px", display: "flex", flexDirection: "column", gap: "20px",
        width: isMobile ? "100%" : "360px", flexShrink: 0, alignSelf: "flex-start",
        position: isMobile ? "static" : "sticky", top: "88px",
      }}
    >
      <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "14px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--white-or-black)", margin: 0 }}>
        Order Summary
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Subtotal */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "var(--text-muted)" }}>Subtotal</span>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "14px", color: "var(--white-or-black)" }}>{fmt(subtotal, currency)}</span>
        </div>
        {/* Shipping */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "var(--text-muted)" }}>Shipping</span>
          {shipping === 0
            ? <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#4ade80", letterSpacing: "0.08em", textTransform: "uppercase" }}>FREE</span>
            : <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "14px", color: "var(--white-or-black)" }}>{fmt(shipping, currency)}</span>
          }
        </div>
        {shipping > 0 && subtotal > 0 && amounts.freeShippingThreshold > 0 && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--accent-color)", margin: 0 }}>
            Add {fmt(amounts.freeShippingThreshold - subtotal, currency)} more for free shipping
          </p>
        )}

        {tax > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "var(--text-muted)" }}>Tax</span>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "14px", color: "var(--white-or-black)" }}>{fmt(tax, currency)}</span>
          </div>
        )}

        <div style={{ borderTop: "1px solid var(--border-muted)", paddingTop: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-color)" }}>Total</span>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "26px", color: "var(--accent-color)", letterSpacing: "-0.02em" }}>{fmt(total, currency)}</span>
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>Incl. all taxes</p>
        </div>
      </div>

      <button
        ref={btnRef}
        id="cart-checkout-btn"
        onClick={handleCheckout}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 40px var(--shadow-color)"; e.currentTarget.style.background = "var(--accent-hover)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "var(--accent-color)"; }}
        style={{ width: "100%", padding: "18px", background: "var(--accent-color)", color: "var(--black-or-white)", border: "none", fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "13px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", outline: "none", transition: "box-shadow 0.25s, background 0.2s, color 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
      >
        Proceed to Checkout <ArrowIcon />
      </button>

      <Link to="/" style={{ textDecoration: "none", textAlign: "center" }}>
        <span
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", cursor: "pointer", transition: "color 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-color)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          ← Continue Shopping
        </span>
      </Link>

      {/* Trust badges */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {[
          { icon: "🔒", text: "Secure checkout" },
          {
            icon: "🚚",
            text: amounts.freeShippingThreshold
              ? `Free shipping above ${fmt(amounts.freeShippingThreshold, currency)}`
              : "Free shipping",
          },
          { icon: "🔄", text: "Easy 7-day returns" },
        ].map((b) => (
          <div key={b.text} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px" }}>{b.icon}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "rgba(229,226,225,0.3)" }}>{b.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Skeleton Loader ────────────────────────────────────────────────────
function CartSkeleton({ isMobile }) {
  const skeletonStyle = (w, h) => ({
    width: w, height: h,
    background: "linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
  });
  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: "flex", gap: isMobile ? "12px" : "24px", padding: "24px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={skeletonStyle(isMobile ? "76px" : "96px", isMobile ? "96px" : "120px")} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={skeletonStyle("60%", "16px")} />
            <div style={skeletonStyle("40%", "12px")} />
            <div style={skeletonStyle("25%", "20px")} />
            <div style={skeletonStyle("30%", "36px")} />
          </div>
        </div>
      ))}
    </>
  );
}

// ── Error Toast ─────────────────────────────────────────────────────────
function ErrorToast({ message, onDismiss }) {
  const toastRef = useRef(null);
  useEffect(() => {
    gsap.fromTo(toastRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power3.out" });
    const t = setTimeout(() => {
      gsap.to(toastRef.current, { y: 60, opacity: 0, duration: 0.3, onComplete: onDismiss });
    }, 4000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      ref={toastRef}
      style={{
        position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)",
        background: "#1a0000", border: "1px solid rgba(255,75,75,0.4)", padding: "14px 24px",
        display: "flex", alignItems: "center", gap: "12px", zIndex: 9999,
        fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#ffb4ab",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)", maxWidth: "420px", width: "90%",
      }}
    >
      <span style={{ fontSize: "16px" }}>⚠</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onDismiss}
        style={{ background: "none", border: "none", color: "rgba(255,180,171,0.5)", cursor: "pointer", padding: "0", fontSize: "16px" }}
      >✕</button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// ── Cart Page ─────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════
const Cart = () => {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const dispatch = useDispatch();
  const { items, amounts, loading, error } = useSelector((s) => s.cart);
  const { getCartItems, removeItemFromCart, updateCartItem } = useCart();

  const headerRef = useRef(null);
  const listRef = useRef(null);
  const [localError, setLocalError] = useState(null);

  // Load cart on mount
  useEffect(() => {
    getCartItems();
  }, []);

  // Animate header in — NO opacity animations (they get stuck at 0)
  useEffect(() => {
    if (!loading && headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -20 },
        { y: 0, duration: 0.4, ease: "power2.out", clearProps: "transform" }
      );
    }
  }, [loading]);

  // Animate list items in when data loads — NO opacity (use y-only entrance)
  useEffect(() => {
    if (!loading && items.length > 0 && listRef.current) {
      gsap.fromTo(
        listRef.current.querySelectorAll("[data-cart-row]"),
        { y: 20 },
        { y: 0, stagger: 0.06, duration: 0.35, ease: "power2.out", clearProps: "transform" }
      );
    }
  }, [loading]);

  // Show global redux error as toast
  useEffect(() => {
    if (error) {
      const msg = typeof error === "string" ? error : error?.message || "Something went wrong";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalError(msg);
      dispatch(setError(null));
    }
  }, [error]);

  const handleRemove = useCallback(async (itemId) => {
    try {
      await removeItemFromCart(itemId);
    } catch {
      setLocalError("Failed to remove item. Please try again.");
    }
  }, [removeItemFromCart]);

  const handleUpdateQty = useCallback(async (itemId, qty) => {
    try {
      await updateCartItem(itemId, qty);
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not update quantity.";
      setLocalError(msg);
    }
  }, [updateCartItem]);

  // The address picker and payment live on /checkout — the cart only hands off.
  const handleCheckout = useCallback(() => {
    navigate("/checkout");
  }, [navigate]);

  const hasItems = items.length > 0;

  return (
    <>
      {/* Font injection */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={FONT_HREF} rel="stylesheet" />

      <div style={{ minHeight: "100vh", background: "var(--bg-color)", color: "var(--text-color)" }}>
        {/* Navbar */}
        <StoreNav />

        {/* Main content */}
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? "32px 20px 80px" : "48px 48px 80px" }}>

          {/* Breadcrumb + header */}
          <div ref={headerRef}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
              <Link to="/" style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(245,197,24,0.5)", textDecoration: "none" }}>Home</Link>
              <span style={{ color: "rgba(229,226,225,0.2)", fontSize: "11px" }}>›</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(229,226,225,0.35)" }}>Cart</span>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "16px", marginBottom: isMobile ? "32px" : "48px", borderBottom: "1px solid rgba(245,197,24,0.1)", paddingBottom: "20px" }}>
              <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: isMobile ? "28px" : "clamp(32px, 4vw, 48px)", letterSpacing: "-0.03em", textTransform: "uppercase", color: "#fff", margin: 0 }}>
                Your Cart
              </h1>
              {hasItems && (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "rgba(245,197,24,0.6)", fontWeight: 600 }}>
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              )}
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div style={{ display: "flex", gap: isMobile ? "0" : "48px", flexDirection: isMobile ? "column" : "row", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <CartSkeleton isMobile={isMobile} />
              </div>
              {!isMobile && <div style={{ width: "360px", height: "400px", background: "linear-gradient(90deg,#1a1a1a 25%,#252525 50%,#1a1a1a 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", flexShrink: 0 }} />}
            </div>
          )}

          {/* Empty state */}
          {!loading && !hasItems && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "24px", padding: "80px 0", textAlign: "center" }}>
              <CartEmptyIcon />
              <div>
                <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: isMobile ? "22px" : "28px", textTransform: "uppercase", color: "#fff", margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
                  Your Cart is Empty
                </h2>
                <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "15px", color: "rgba(209,197,172,0.5)", margin: 0 }}>
                  Explore the latest drops and add something bold.
                </p>
              </div>
              <Link to="/">
                <button
                  style={{ padding: "14px 36px", background: "#F5C518", color: "#0a0a0a", border: "none", fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", outline: "none", transition: "box-shadow 0.25s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 40px rgba(245,197,24,0.4)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                >
                  Shop Now
                </button>
              </Link>
            </div>
          )}

          {/* Cart layout */}
          {!loading && hasItems && (
            <div style={{ display: "flex", gap: isMobile ? "0" : "48px", flexDirection: isMobile ? "column" : "row", alignItems: "flex-start" }}>
              {/* Items list */}
              <div ref={listRef} style={{ flex: 1, minWidth: 0 }}>
                {items.map((item) => (
                  <div key={item._id} data-cart-row="true">
                    <CartItemRow
                      item={item}
                      onRemove={handleRemove}
                      onUpdateQty={handleUpdateQty}
                      loading={loading}
                      isMobile={isMobile}
                    />
                  </div>
                ))}
              </div>

              {/* Order summary */}
              {isMobile ? (
                <div style={{ width: "100%", marginTop: "32px" }}>
                  <OrderSummary items={items} amounts={amounts} isMobile={isMobile} onCheckout={handleCheckout} />
                </div>
              ) : (
                <OrderSummary items={items} amounts={amounts} isMobile={isMobile} onCheckout={handleCheckout} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Global error toast */}
      {localError && (
        <ErrorToast message={localError} onDismiss={() => setLocalError(null)} />
      )}
    </>
  );
};

export default Cart;
