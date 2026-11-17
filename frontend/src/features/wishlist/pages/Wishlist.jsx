import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router";
import { gsap } from "gsap";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import StoreNav from "../../../components/StoreNav";
import { useWishlist } from "../hooks/useWishlist";
import { useCart } from "../../cart/hooks/useCart";
import { setError } from "../state/wishlist.slice";
import { fmt } from "../../checkout/pricing";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap";

function HeartEmptyIcon() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--gold-tint-deep)"
      strokeWidth="1"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.7-7.7 1.1-1.1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

function WishlistCard({ item, onRemove, onMoveToCart, busy, isMobile }) {
  const cardRef = useRef(null);
  const product = item.product;

  // A guest's item carries a one-image snapshot; a signed-in user's carries the
  // whole product. Both expose `images`, so this reads the same either way.
  const variant = item.variant
    ? product.variant?.find((v) => v._id === item.variant)
    : undefined;
  const images = variant?.images?.length ? variant.images : product.images;
  const thumb = images?.[0]?.url;
  const price = variant?.price || product.price;

  // Only a signed-in user's item has the full variant array, so only there can
  // we know a size to add. Guests get sent to the product page to choose.
  const addableVariantId = item.variant || product.variant?.[0]?._id;
  const stock = variant?.stock ?? product.variant?.[0]?.stock;
  const soldOut = stock === 0;

  const handleRemove = () => {
    gsap.to(cardRef.current, {
      opacity: 0,
      y: -12,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => onRemove(product._id),
    });
  };

  return (
    <div
      ref={cardRef}
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border-muted)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <Link to={`/product/${product._id}`} style={{ textDecoration: "none" }}>
        <div
          style={{
            width: "100%",
            aspectRatio: "3/4",
            background: "var(--surface-color)",
            overflow: "hidden",
          }}
        >
          {thumb ? (
            <img
              src={thumb}
              alt={product.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--gold-tint-deep)",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
                <rect x="3" y="3" width="18" height="18" rx="1" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
        </div>
      </Link>

      <div style={{ padding: isMobile ? "14px" : "16px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
        <Link to={`/product/${product._id}`} style={{ textDecoration: "none" }}>
          <h3
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: "13px",
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
              color: "var(--text-color)",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {product.title}
          </h3>
        </Link>

        <p
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 800,
            fontSize: "16px",
            color: "var(--accent-color)",
            margin: 0,
          }}
        >
          {fmt(price?.amount, price?.currency)}
        </p>

        <div style={{ display: "flex", gap: "8px", marginTop: "auto", paddingTop: "6px" }}>
          <button
            onClick={() => onMoveToCart(item, addableVariantId)}
            disabled={busy || soldOut}
            style={{
              flex: 1,
              padding: "11px",
              background: soldOut ? "transparent" : "var(--accent-color)",
              color: soldOut ? "var(--text-muted)" : "var(--black-or-white)",
              border: soldOut ? "1px solid var(--border-muted)" : "none",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: "10px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: busy || soldOut ? "not-allowed" : "pointer",
              outline: "none",
              opacity: busy ? 0.6 : 1,
            }}
          >
            {soldOut ? "Sold Out" : "Move to Cart"}
          </button>

          <button
            onClick={handleRemove}
            aria-label="Remove from wishlist"
            style={{
              width: "38px",
              background: "transparent",
              border: "1px solid var(--border-muted)",
              color: "var(--text-muted)",
              cursor: "pointer",
              outline: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.18s, border-color 0.18s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ff6b6b";
              e.currentTarget.style.borderColor = "rgba(255,107,107,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.borderColor = "var(--border-muted)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" strokeLinecap="square" />
              <path d="M19 6l-1 14H6L5 6" strokeLinecap="square" />
              <path d="M10 11v6M14 11v6" strokeLinecap="square" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();

  const user = useSelector((s) => s.auth.user);
  const { items, loading, error } = useSelector((s) => s.wishlist);
  const { loadWishlist, removeItem } = useWishlist();
  const { addItemToCart } = useCart();

  const gridRef = useRef(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    loadWishlist();
  }, [user]);

  useEffect(() => {
    if (!loading && items.length > 0 && gridRef.current) {
      gsap.fromTo(
        gridRef.current.querySelectorAll("[data-wish-card]"),
        { y: 18 },
        { y: 0, stagger: 0.05, duration: 0.35, ease: "power2.out", clearProps: "transform" },
      );
    }
  }, [loading, items.length]);

  const handleMoveToCart = async (item, variantId) => {
    // No variant in hand — the buyer has to pick a size, so send them to the
    // product page rather than guessing on their behalf.
    if (!variantId) {
      navigate(`/product/${item.product._id}`);
      return;
    }

    setBusyId(item.product._id);
    try {
      await addItemToCart(item.product._id, variantId, 1);
      await removeItem(item.product._id);
    } catch {
      dispatch(setError("Couldn't move that to your cart."));
    } finally {
      setBusyId(null);
    }
  };

  const hasItems = items.length > 0;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={FONT_HREF} rel="stylesheet" />

      <div style={{ minHeight: "100vh", background: "var(--bg-color)", color: "var(--text-color)" }}>
        <StoreNav />

        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: isMobile ? "32px 20px 80px" : "48px 48px 80px",
          }}
        >
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
            <Link
              to="/"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(245,197,24,0.5)",
                textDecoration: "none",
              }}
            >
              Home
            </Link>
            <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>›</span>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}
            >
              Wishlist
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: isMobile ? "28px" : "40px",
              borderBottom: "1px solid var(--surface-border)",
              paddingBottom: "20px",
            }}
          >
            <h1
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 900,
                fontSize: isMobile ? "28px" : "clamp(32px, 4vw, 48px)",
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
                color: "var(--white-or-black)",
                margin: 0,
              }}
            >
              Wishlist
            </h1>
            {hasItems && (
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "var(--accent-color)", fontWeight: 600 }}>
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            )}
          </div>

          {/* Guests keep their list in this browser only — say so plainly. */}
          {!user && hasItems && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                padding: "14px 18px",
                marginBottom: "28px",
                background: "var(--gold-tint)",
                border: "1px solid var(--gold-tint-deep)",
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                color: "var(--accent-color)",
              }}
            >
              <span style={{ flex: 1, minWidth: "220px" }}>
                Saved on this device.{" "}
                <Link to="/login" style={{ color: "var(--accent-color)", fontWeight: 700 }}>
                  Sign in
                </Link>{" "}
                to keep them on your account.
              </span>
            </div>
          )}

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 18px",
                marginBottom: "24px",
                background: "rgba(255,75,75,0.08)",
                border: "1px solid rgba(255,75,75,0.35)",
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                color: "#ffb4ab",
              }}
            >
              <span style={{ flex: 1 }}>{error}</span>
              <button
                onClick={() => dispatch(setError(null))}
                style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "15px" }}
              >
                ✕
              </button>
            </div>
          )}

          {loading && !hasItems && (
            <p style={{ fontFamily: "'Inter', sans-serif", color: "var(--text-muted)" }}>
              Loading your saved items…
            </p>
          )}

          {!loading && !hasItems && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "22px",
                padding: "72px 0",
                textAlign: "center",
              }}
            >
              <HeartEmptyIcon />
              <div>
                <h2
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 900,
                    fontSize: isMobile ? "22px" : "28px",
                    textTransform: "uppercase",
                    color: "var(--white-or-black)",
                    margin: "0 0 8px 0",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Nothing Saved Yet
                </h2>
                <p
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: "italic",
                    fontSize: "15px",
                    color: "var(--text-muted)",
                    margin: 0,
                  }}
                >
                  Tap the heart on anything you want to come back to.
                </p>
              </div>
              <Link to="/" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    padding: "14px 36px",
                    background: "var(--accent-color)",
                    color: "var(--black-or-white)",
                    border: "none",
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 900,
                    fontSize: "12px",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  Start Browsing
                </button>
              </Link>
            </div>
          )}

          {hasItems && (
            <div
              ref={gridRef}
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(2, minmax(0, 1fr))"
                  : "repeat(auto-fill, minmax(230px, 1fr))",
                gap: isMobile ? "12px" : "20px",
              }}
            >
              {items.map((item) => (
                <div key={item.product?._id} data-wish-card="true">
                  <WishlistCard
                    item={item}
                    isMobile={isMobile}
                    busy={busyId === item.product?._id}
                    onRemove={removeItem}
                    onMoveToCart={handleMoveToCart}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
