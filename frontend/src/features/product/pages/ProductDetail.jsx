import { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProduct } from "../hooks/useProduct";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import { useCart } from "../../cart/hooks/useCart";
import WishlistButton from "../../wishlist/components/WishlistButton";
import ThemeToggle from "../../../components/ThemeToggle";

gsap.registerPlugin(ScrollTrigger);

// ── Fonts ─────────────────────────────────────────────────────────────
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap";

// ── Helpers ───────────────────────────────────────────────────────────
const CURRENCY = { INR: "₹", USD: "$", EUR: "€", GBP: "£", JPY: "¥" };
const initials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
const fmt = (n, currency = "INR") =>
  `${CURRENCY[currency] || "₹"}${Number(n).toLocaleString("en-IN")}`;



// ══════════════════════════════════════════════════════════════════════
// ── NavBar ────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════
function NavBar({ user, navigate,totalQty }) {
  const navRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isMobile } = useBreakpoint();


  useEffect(() => {
    // Kill any stuck tweens from a previous mount (e.g., React Strict Mode, hot reload)
    // then reset inline styles so the element is visible even if animation doesn't fire
    gsap.killTweensOf(navRef.current);
    gsap.set(navRef.current, { clearProps: "all" });
    gsap.from(navRef.current, { y: -70, opacity: 0, duration: 0.9, ease: "power3.out" });
  }, []);

  // Close menu on desktop resize
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  return (
    <>
      <nav
        ref={navRef}
        className="flex items-center justify-between px-4 h-[64px]"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--nav-bg)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid var(--surface-border)",
          display: 'flex',
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "0 16px" : "0 32px",
          height: "64px"
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: isMobile ? "18px" : "22px", letterSpacing: "-0.03em", color: "var(--white-or-black)" ,margin: isMobile ? 0:"0 0 0 32px"}}>
            ECOMFY
          </span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "11px", color: "var(--accent-color)", marginTop: "4px" }}>™</span>
        </Link>

        {/* Desktop nav links */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            {["Shop", "Drops", "Sellers"].map((label) => (
              <span
                key={label}
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--nav-link-color)", cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-color)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--nav-link-color)")}
              >{label}</span>
            ))}
          </div>
        )}

        {/* Right: auth + hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <ThemeToggle />
          {user ? (<>
            <Link to="/cart" style={{ position: "relative", display: "flex", alignItems: "center", textDecoration: "none",margin: isMobile ? "-5px" : "0 10px", marginRight: isMobile ? "10px" : "20px" }}>
                                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-color)" strokeWidth="1.8">
                                        <path d="M3 3h2l3.5 14h9.5l3-9H7" strokeLinecap="square" />
                                        <circle cx="9" cy="21" r="1.5" fill="var(--text-color)" stroke="none" />
                                        <circle cx="19" cy="21" r="1.5" fill="var(--text-color)" stroke="none" />
                                      </svg>
                                      {totalQty > 0 && (
                                        <span style={{ position: "absolute", top: "-6px", right: "-8px", background: "var(--accent-color)", color: "var(--black-or-white)", fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "9px", borderRadius: "50%", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                          {totalQty}
                                        </span>
                                      )}
            </Link>
            <div
              style={{ width: "34px", height: "34px", background: "var(--accent-color)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "13px", color: "var(--black-or-white)", cursor: "pointer", flexShrink: 0 ,margin: isMobile ? 0:"0 32px 0 0"}}
              onClick={() => navigate(user.role === "seller" ? "/seller/products" : "/")}
            >
              {initials(user.fullname)}
            </div>
            </>
          ) : (
            <Link
              to="/login"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--black-or-white)", background: "var(--accent-color)", padding: isMobile ? "8px 14px" : "9px 22px", textDecoration: "none", display: "inline-block", transition: "box-shadow 0.25s" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 28px var(--shadow-color)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
            >
              Login
            </Link>
          )}
          {/* Hamburger — mobile only */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px", display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <span style={{ display: "block", width: "22px", height: "2px", background: menuOpen ? "var(--accent-color)" : "var(--text-color)", transition: "all 0.25s", transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
              <span style={{ display: "block", width: "22px", height: "2px", background: "var(--text-color)", transition: "opacity 0.25s", opacity: menuOpen ? 0 : 1 }} />
              <span style={{ display: "block", width: "22px", height: "2px", background: menuOpen ? "var(--accent-color)" : "var(--text-color)", transition: "all 0.25s", transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={{ background: "var(--surface-color)", borderBottom: "1px solid var(--surface-border)", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "0", zIndex: 99, position: "relative" }}>
          {["Shop", "Drops", "Sellers"].map((label) => (
            <span
              key={label}
              onClick={() => setMenuOpen(false)}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(229,226,225,0.5)", cursor: "pointer", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-color)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(229,226,225,0.5)")}
            >{label}</span>
          ))}
        </div>
      )}
    </>
  );
}

// ── Ticker Tape ───────────────────────────────────────────────────────
const TICKER_TEXT = "NEW DROP  ·  EXCLUSIVE STYLES  ·  FREE SHIPPING ABOVE ₹999  ·  ECOMFY SS25  ·  STYLE MEETS COMFORT  ·  ";
function TickerTape() {
  const tickerRef = useRef(null);
  useEffect(() => {
    gsap.to(tickerRef.current, { x: "-50%", duration: 20, ease: "none", repeat: -1 });
  }, []);
  return (
    <div style={{ background: "var(--accent-color)", overflow: "hidden", whiteSpace: "nowrap", padding: "8px 0" }}>
      <span ref={tickerRef} style={{ display: "inline-block", fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "11px", letterSpacing: "0.2em", color: "var(--black-or-white)" }}>
        {TICKER_TEXT.repeat(10)}
      </span>
    </div>
  );
}

// ── Placeholder image ─────────────────────────────────────────────────
function PlaceholderImg({ small }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(var(--accent-rgb),0.12)" }}>
      <svg width={small ? "24" : "44"} height={small ? "24" : "44"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
        <rect x="3" y="3" width="18" height="18" rx="1" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );
}

// ── Image Gallery ─────────────────────────────────────────────────────
function ImageGallery({ images, isMobile }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const heroRef = useRef(null);
  const imgs = images.slice(0, 7);

  useEffect(() => {
    gsap.fromTo(heroRef.current, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 0.55, ease: "power2.out" });
  }, [activeIdx]);

  const selectImage = useCallback((idx) => {
    gsap.to(heroRef.current, { opacity: 0, scale: 1.03, duration: 0.2, ease: "power2.in", onComplete: () => setActiveIdx(idx) });
  }, []);

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: "12px",
      flex: isMobile ? "none" : "0 0 auto",
      width: isMobile ? "100%" : "min(50%, 560px)",
    }}>
      {/* Hero image */}
      <div style={{ position: "relative", width: "100%", aspectRatio: isMobile ? "3/4" : "4/5", background: "var(--card-bg)", overflow: "hidden", border: "1px solid rgba(var(--accent-rgb),0.08)" }}>
        <div ref={heroRef} style={{ width: "100%", height: "100%" }}>
          {imgs[activeIdx]?.url
            ? <img src={imgs[activeIdx].url} alt={`product-${activeIdx}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : <PlaceholderImg />
          }
        </div>
        <div style={{ position: "absolute", top: "14px", left: "14px", background: "var(--accent-color)", color: "var(--black-or-white)", fontFamily: "'Montserrat', sans-serif", fontSize: "8px", fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", padding: "4px 9px" }}>
          NEW DROP
        </div>
        <div style={{ position: "absolute", bottom: "14px", right: "14px", background: "var(--surface-color)", backdropFilter: "blur(8px)", padding: "4px 10px", fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", color: "rgba(229,226,225,0.7)" }}>
          {activeIdx + 1} / {imgs.length}
        </div>
      </div>

      {/* Thumbnails */}
      {imgs.length > 1 && (
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          {imgs.map((img, i) => (
            <button
              key={img._id || i}
              onClick={() => selectImage(i)}
              style={{
                flexShrink: 0,
                width: isMobile ? "60px" : "72px",
                height: isMobile ? "74px" : "88px",
                padding: 0,
                border: i === activeIdx ? "2px solid var(--accent-color)" : "2px solid transparent",
                background: "var(--card-bg)", cursor: "pointer", overflow: "hidden",
                transition: "border-color 0.2s", outline: "none",
              }}
              onMouseEnter={(e) => { if (i !== activeIdx) e.currentTarget.style.borderColor = "rgba(var(--accent-rgb),0.4)"; }}
              onMouseLeave={(e) => { if (i !== activeIdx) e.currentTarget.style.borderColor = "transparent"; }}
            >
              {img.url
                ? <img src={img.url} alt={`thumb-${i}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                : <PlaceholderImg small />
              }
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Size Chip ─────────────────────────────────────────────────────────
function SizeChip({ label, active, onClick }) {
  const chipRef = useRef(null);
  const enter = () => !active && gsap.to(chipRef.current, { borderColor: "var(--accent-color)", color: "var(--accent-color)", duration: 0.18 });
  const leave = () => !active && gsap.to(chipRef.current, { borderColor: "var(--border-muted)", color: "var(--text-muted)", duration: 0.18 });

  return (
    <button
      ref={chipRef}
      onClick={onClick}
      onMouseEnter={enter}
      onMouseLeave={leave}
      style={{
        padding: "9px 16px",
        fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "12px",
        letterSpacing: "0.1em", textTransform: "uppercase",
        background: active ? "var(--accent-color)" : "transparent",
        color: active ? "var(--black-or-white)" : "var(--text-color)",
        border: active ? "2px solid var(--accent-color)" : "2px solid var(--border-muted)",
        cursor: "pointer", outline: "none", transition: "background 0.18s",
        minWidth: "48px", touchAction: "manipulation",
      }}
    >
      {label}
    </button>
  );
}

// ── Color Swatch ──────────────────────────────────────────────────────
function ColorSwatch({ option, active, onClick }) {
  return (
    <button
      onClick={onClick}
      title={option.name}
      style={{
        width: "36px", height: "36px", background: option.hex,
        border: active ? "3px solid var(--accent-color)" : "2px solid var(--border-muted)",
        cursor: "pointer", outline: "none", transition: "border 0.15s", position: "relative",
        touchAction: "manipulation",
      }}
    >
      {active && (
        <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <polyline points="2,6 5,9 10,3" stroke={option.hex === "#f0ece4" || option.hex === "#c8b49a" ? "var(--black-or-white)" : "var(--accent-color)"} strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
          </svg>
        </span>
      )}
    </button>
  );
}

// ── Product Info Panel ────────────────────────────────────────────────
function ProductInfo({
  product,
  isMobile,
  selectedAttrs,
  setSelectedAttrs,
  selectedVariant,
  isDbVariants,
}) {
  const [selectedVariants, setSelectedVariants] = useState({}); // Mock Variants Fallback
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartError, setCartError] = useState(null);
  const panelRef = useRef(null);
  const ctaRef = useRef(null);
  const { addItemToCart } = useCart();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".pdp-line", {
        y: 40, opacity: 0, duration: 0.65, stagger: 0.1,
        ease: "power3.out", delay: isMobile ? 0.1 : 0.3,
      });
    }, panelRef);
    return () => ctx.revert();
  }, []); //gsap animation

  const dbAttributeOptions = {};
  if (isDbVariants && product.variant) {
    product.variant.forEach((v) => {
      if (v.attributes) {
        const attrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes;
        Object.entries(attrs).forEach(([key, val]) => {
          const normalizedKey = key.toLowerCase();
          if (!dbAttributeOptions[normalizedKey]) {
            dbAttributeOptions[normalizedKey] = new Set();
          }
          dbAttributeOptions[normalizedKey].add(val);
        });
      }
    });
  }

  const isOutOfStock = isDbVariants
    ? (!selectedVariant || selectedVariant.stock <= 0)
    : (selectedVariant && selectedVariant.stock <= 0);

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    gsap.timeline()
      .to(ctaRef.current, { scale: 0.97, duration: 0.12, ease: "power2.in" })
      .to(ctaRef.current, { scale: 1, duration: 0.25, ease: "back.out(2)" });
    try {
      await addItemToCart(product._id, selectedVariant?._id, qty);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2200);
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not add to cart";
      setCartError(msg);
      setTimeout(() => setCartError(null), 4000);
    }
  };

  const changeQty = (delta) => setQty((q) => Math.max(1, q + delta));

  const currentPriceAmount = (selectedVariant && selectedVariant.price && selectedVariant.price.amount > 0)
    ? selectedVariant.price.amount
    : product.price.amount;
  const currentPriceCurrency = (selectedVariant && selectedVariant.price && selectedVariant.price.currency)
    ? selectedVariant.price.currency
    : product.price.currency;

  return (
    <div
      ref={panelRef}
      style={{
        flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "24px",
        paddingLeft: isMobile ? "0" : "clamp(24px, 4vw, 64px)",
        paddingTop: isMobile ? "24px" : "0",
        paddingBottom: isMobile ? "100px" : "0",
      }}
    >
      {/* Breadcrumb */}
      <div className="pdp-line" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <Link to="/" style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(var(--accent-rgb),0.5)", textDecoration: "none" }}>
          Shop
        </Link>
        <span style={{ color: "rgba(229,226,225,0.2)", fontSize: "11px" }}>›</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(229,226,225,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }}>
          {product.title}
        </span>
      </div>

      {/* Title area */}
      <div className="pdp-line" style={{ borderBottom: "1px solid rgba(var(--accent-rgb),0.1)", paddingBottom: "20px" }}>
        <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: isMobile ? "clamp(24px, 8vw, 36px)" : "clamp(26px, 3.5vw, 42px)", letterSpacing: "-0.03em", textTransform: "uppercase", color: "var(--white-or-black)", margin: "0 0 8px 0", lineHeight: 1.05 }}>
          {product.title}
        </h1>
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: isMobile ? "14px" : "clamp(14px, 1.5vw, 18px)", color: "rgba(209,197,172,0.6)", margin: 0 }}>
          Elevated style — limited drop
        </p>
      </div>

      {/* Price */}
      <div className="pdp-line" style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
        <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: isMobile ? "32px" : "clamp(28px, 3vw, 40px)", color: "var(--accent-color)", letterSpacing: "-0.02em" }}>
          {fmt(currentPriceAmount, currentPriceCurrency)}
        </span>
        <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "14px", color: "rgba(var(--accent-rgb),0.45)" }}>
          {currentPriceCurrency}
        </span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(229,226,225,0.3)" }}>
          incl. taxes
        </span>
      </div>

      {/* Variants */}
      {isDbVariants ? (
        // ── Real DB Variants Display ──
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {Object.entries(dbAttributeOptions).map(([key, valueSet]) => {
            const values = Array.from(valueSet);
            const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
            return (
              <div key={key} className="pdp-line" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(229,226,225,0.5)" }}>
                  {capitalizedKey}
                  {selectedAttrs[key] && (
                    <span style={{ color: "#F5C518", marginLeft: "6px" }}>— {selectedAttrs[key]}</span>
                  )}
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {values.map((val) => {
                    const isActive = selectedAttrs[key] === val;
                    if (key.toLowerCase() === "color") {
                      // Find a variant that has this color value to extract its image preview (or fall back to color text if no image)
                      const matchingVar = product.variant.find((v) => {
                        if (!v.attributes) return false;
                        const attrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes;
                        return Object.entries(attrs).some(([k, valVal]) => k.toLowerCase() === "color" && valVal === val);
                      });
                      const variantImg = matchingVar?.image;

                      return (
                        <button
                          key={val}
                          onClick={() => {
                            setSelectedAttrs((prev) => ({
                              ...prev,
                              [key]: val,
                            }));
                          }}
                          style={{
                            width: "56px",
                            height: "56px",
                            background: isActive ? "var(--accent-color)" : "transparent",
                            color: isActive ? "var(--black-or-white)" : "var(--text-color)",
                            border: isActive ? "2px solid var(--accent-color)" : "2px solid var(--border-muted)",
                            padding: "2px",
                            cursor: "pointer",
                            outline: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "border-color 0.2s, transform 0.2s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                          title={val}
                        >
                          {variantImg ? (
                            <img src={variantImg} alt={val} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#e5e2e1" }}>
                              {val}
                            </span>
                          )}
                        </button>
                      );
                    }

                    return (
                      <SizeChip
                        key={val}
                        label={val}
                        active={isActive}
                        onClick={() => {
                          setSelectedAttrs((prev) => ({
                            ...prev,
                            [key]: val,
                          }));
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Selected Variant Status Indicator */}
          {selectedVariant && (
            <div className="pdp-line" style={{ marginTop: "4px" }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: selectedVariant.stock > 0 ? "var(--accent-color)" : "#ffb4ab", fontWeight: 600 }}>
                {selectedVariant.stock > 0 ? `In Stock (${selectedVariant.stock} available)` : "Variant Sold Out"}
              </span>
            </div>
          )}
        </div>
      ) : (
        // ── Mock Variants Fallback ──
        product.variant?.map((v) => (
          <div className="pdp-line" key={v._id} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(229,226,225,0.5)" }}>
                {v.label}
                {v.type === "size" && selectedVariants[v._id] && (
                  <span style={{ color: "var(--accent-color)", marginLeft: "6px" }}>— {selectedVariants[v._id]}</span>
                )}
              </span>
              {v.type === "size" && (
                <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "12px", color: "rgba(var(--accent-rgb),0.45)", cursor: "pointer", whiteSpace: "nowrap" }}>
                  Size guide →
                </span>
              )}
            </div>

            {v.type === "size" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {v.options.map((opt) => (
                  <SizeChip key={opt} label={opt} active={selectedVariants[v._id] === opt}
                    onClick={() => setSelectedVariants((prev) => ({ ...prev, [v._id]: opt }))} />
                ))}
              </div>
            )}

            {v.type === "color" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                {v.options.map((opt) => (
                  <ColorSwatch key={opt.name} option={opt} active={selectedVariants[v._id] === opt.name}
                    onClick={() => setSelectedVariants((prev) => ({ ...prev, [v._id]: opt.name }))} />
                ))}
                {selectedVariants[v._id] && (
                  <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "13px", color: "rgba(209,197,172,0.5)" }}>
                    {selectedVariants[v._id]}
                  </span>
                )}
              </div>
            )}
          </div>
        ))
      )}

      {/* Quantity + CTA ── desktop only */}
      {!isMobile && (
        <div className="pdp-line" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Qty selector */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(229,226,225,0.5)", marginRight: "16px" }}>Qty</span>
            <button onClick={() => changeQty(-1)}
              style={{ width: "40px", height: "40px", background: "transparent", border: "1px solid rgba(229,226,225,0.15)", color: "#e5e2e1", fontSize: "18px", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", outline: "none", transition: "border-color 0.2s, color 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#F5C518"; e.currentTarget.style.color = "#F5C518"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(229,226,225,0.15)"; e.currentTarget.style.color = "#e5e2e1"; }}>−</button>
            <div style={{ width: "56px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "15px", color: "#fff", borderTop: "1px solid rgba(229,226,225,0.15)", borderBottom: "1px solid rgba(229,226,225,0.15)" }}>
              {qty}
            </div>
            <button onClick={() => changeQty(1)}
              style={{ width: "40px", height: "40px", background: "transparent", border: "1px solid var(--border-muted)", color: "var(--text-color)", fontSize: "18px", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", outline: "none", transition: "border-color 0.2s, color 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-color)"; e.currentTarget.style.color = "var(--accent-color)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-muted)"; e.currentTarget.style.color = "var(--text-color)"; }}>+</button>
          </div>

          {/* Add to Cart */}
          <button ref={ctaRef} id="pdp-add-to-cart" onClick={handleAddToCart} disabled={isOutOfStock}
            style={{ width: "100%", padding: "17px 28px", background: isOutOfStock ? "var(--surface-color)" : addedToCart ? "var(--bg-color)" : "var(--accent-color)", color: isOutOfStock ? "var(--text-muted)" : addedToCart ? "var(--accent-color)" : "var(--black-or-white)", border: isOutOfStock ? "2px solid var(--surface-color)" : "2px solid var(--accent-color)", fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "13px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: isOutOfStock ? "not-allowed" : "pointer", outline: "none", transition: "background 0.3s, color 0.3s, box-shadow 0.3s", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
            onMouseEnter={(e) => { if (!addedToCart && !isOutOfStock) { e.currentTarget.style.boxShadow = "0 0 40px rgba(var(--accent-rgb),0.4)"; e.currentTarget.style.background = "var(--accent-hover)"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; if (!addedToCart && !isOutOfStock) e.currentTarget.style.background = "var(--accent-color)"; }}>
            {isOutOfStock ? (isDbVariants && !selectedVariant ? "UNAVAILABLE" : "OUT OF STOCK") : addedToCart ? (<><CartCheckIcon /> Added to Cart</>) : (<><CartIcon /> Add to Cart</>)}
          </button>

          {/* Wishlist — remembers the size they were looking at */}
          <div id="pdp-wishlist" style={{ display: "flex" }}>
            <WishlistButton
              product={product}
              variantId={selectedVariant?._id}
              variant="full"
              size={16}
            />
          </div>

          {/* Cart error */}
          {cartError && (
            <div style={{ padding: "12px 16px", background: "rgba(255,75,75,0.08)", border: "1px solid rgba(255,75,75,0.25)", fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#ffb4ab" }}>
              ⚠ {cartError}
            </div>
          )}

          {/* View Cart shortcut shown after adding */}
          {addedToCart && (
            <Link to="/cart" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "11px", border: "1px solid rgba(var(--accent-rgb),0.25)", textDecoration: "none", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent-color)", transition: "background 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(var(--accent-rgb),0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
              View Cart →
            </Link>
          )}
        </div>
      )}

      {/* Trust badges */}
      <div className="pdp-line" style={{ display: "flex", gap: isMobile ? "12px" : "20px", flexWrap: "wrap" }}>
        {[
          { icon: "🚚", text: "Free Shipping above ₹999" },
          { icon: "🔄", text: "Easy 7-day returns" },
          { icon: "✦", text: "Authentic drop" },
        ].map((b) => (
          <div key={b.text} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "13px" }}>{b.icon}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 500, color: "var(--text-muted)" }}>{b.text}</span>
          </div>
        ))}
      </div>

      {/* Seller info */}
      <div className="pdp-line" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px", background: "var(--card-bg)", border: "1px solid rgba(var(--accent-rgb),0.08)" }}>
        <div style={{ width: "40px", height: "40px", background: "var(--accent-color)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "14px", color: "var(--black-or-white)", flexShrink: 0 }}>
          {typeof product.seller === "object" ? initials(product.seller.fullname) : "SE"}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#e5e2e1" }}>
              {typeof product.seller === "object" ? product.seller.fullname : "ECOMFY ELITE"}
            </span>
            {(typeof product.seller === "object" ? product.seller.verified : true) && (
              <span style={{ background: "#F5C518", color: "#0a0a0a", fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "8px", letterSpacing: "0.1em", padding: "2px 5px" }}>
                VERIFIED
              </span>
            )}
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "12px", color: "var(--text-muted)" }}>
            Official ECOMFY drop seller
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Mobile Sticky CTA Bar ─────────────────────────────────────────────
// ── Mobile Sticky CTA Bar ─────────────────────────────────────────────
function MobileStickyBar({ product, selectedVariant, isDbVariants, productId }) {
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const ctaRef = useRef(null);
  const { addItemToCart } = useCart();

  const isOutOfStock = isDbVariants
    ? (!selectedVariant || selectedVariant.stock <= 0)
    : (selectedVariant && selectedVariant.stock <= 0);

  const handleAdd = async () => {
    if (isOutOfStock) return;
    gsap.timeline()
      .to(ctaRef.current, { scale: 0.97, duration: 0.12, ease: "power2.in" })
      .to(ctaRef.current, { scale: 1, duration: 0.25, ease: "back.out(2)" });
    try {
      await addItemToCart(productId, selectedVariant?._id, qty);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2200);
    } catch {
      setAddedToCart(false);
    }
  };

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
      background: "var(--nav-bg)", backdropFilter: "blur(16px)",
      borderTop: "1px solid rgba(var(--accent-rgb),0.15)",
      padding: "12px 16px",
      display: "flex", alignItems: "center", gap: "10px",
    }}>
      {/* Qty */}
      <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
        <button onClick={() => setQty((q) => Math.max(1, q - 1))}
          style={{ width: "36px", height: "36px", background: "transparent", border: "1px solid var(--border-muted)", color: "var(--text-color)", fontSize: "16px", cursor: "pointer", outline: "none" }}>−</button>
        <div style={{ width: "40px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "14px", color: "var(--text-color)", borderTop: "1px solid var(--border-muted)", borderBottom: "1px solid var(--border-muted)" }}>
          {qty}
        </div>
        <button onClick={() => setQty((q) => q + 1)}
          style={{ width: "36px", height: "36px", background: "transparent", border: "1px solid var(--border-muted)", color: "var(--text-color)", fontSize: "16px", cursor: "pointer", outline: "none" }}>+</button>
      </div>

      {/* Add to cart */}
      <button ref={ctaRef} onClick={handleAdd} disabled={isOutOfStock}
        style={{ flex: 1, height: "48px", background: isOutOfStock ? "var(--surface-color)" : addedToCart ? "var(--bg-color)" : "var(--accent-color)", color: isOutOfStock ? "var(--text-muted)" : addedToCart ? "var(--accent-color)" : "var(--black-or-white)", border: isOutOfStock ? "2px solid var(--surface-color)" : "2px solid var(--accent-color)", fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", cursor: isOutOfStock ? "not-allowed" : "pointer", outline: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background 0.3s, color 0.3s" }}>
        {isOutOfStock ? (isDbVariants && !selectedVariant ? "UNAVAILABLE" : "OUT OF STOCK") : addedToCart ? (<><CartCheckIcon />Added!</>) : (<><CartIcon />Add to Cart</>)}
      </button>

      {/* Wishlist icon */}
      <WishlistButton
        product={product}
        variantId={selectedVariant?._id}
        variant="bare"
        size={20}
      />
    </div>
  );
}

// ── Description Section ───────────────────────────────────────────────
function DescriptionSection({ product, isMobile }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".desc-reveal", {
        y: 36, opacity: 0, duration: 0.7, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none none" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const hardcodedDetails = [
    { label: "Material", value: "400GSM French-Terry Cotton" },
    { label: "Fit", value: "Oversized / Dropped Shoulder" },
    { label: "Wash", value: "Machine wash cold, inside out" },
    { label: "Origin", value: "Crafted in India" },
  ];

  const customSpecs = product.attributes
    ? Object.entries(
        product.attributes instanceof Map
          ? Object.fromEntries(product.attributes)
          : product.attributes
      ).map(([key, val]) => ({ label: key, value: val }))
    : [];

  const customKeys = new Set(customSpecs.map(s => s.label.toLowerCase()));

  const details = [
    ...customSpecs,
    ...hardcodedDetails.filter(d => !customKeys.has(d.label.toLowerCase())),
    { label: "SKU", value: product._id?.slice(-8).toUpperCase() },
    { label: "Listed", value: new Date(product.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) },
  ];

  return (
    <section ref={sectionRef} style={{ maxWidth: "1200px", margin: "0 auto", padding: isMobile ? "48px 20px" : "80px 40px" }}>
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? "32px" : "0",
        borderTop: "1px solid rgba(var(--accent-rgb),0.1)",
      }}>
        {/* Left: description */}
        <div style={{ flex: 1, paddingRight: isMobile ? "0" : "clamp(24px, 5vw, 80px)", paddingTop: "40px" }}>
          <span className="desc-reveal" style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--accent-color)", marginBottom: "14px" }}>
            The Drop Story
          </span>
          <h2 className="desc-reveal" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: isMobile ? "22px" : "clamp(22px, 2.5vw, 30px)", color: "var(--text-color)", margin: "0 0 18px 0", fontWeight: 400, lineHeight: 1.4 }}>
            &ldquo;{product.title}&rdquo;
          </h2>
          <p className="desc-reveal" style={{ fontFamily: "'Inter', sans-serif", fontSize: isMobile ? "14px" : "15px", lineHeight: 1.8, color: "var(--text-color)", margin: "0 0 20px 0" }}>
            {product.description}
          </p>
          <p className="desc-reveal" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "14px", lineHeight: 1.75, color: "var(--text-muted)" }}>
            Every stitch is intentional. Every drop is a statement. ECOMFY doesn't follow trends — it sets them. This piece is a collector's item for the discerning streetwear connoisseur.
          </p>
        </div>

        {/* Right: product details */}
        <div style={{
          flex: isMobile ? "none" : "0 0 auto",
          width: isMobile ? "100%" : "clamp(220px, 30%, 340px)",
          borderLeft: isMobile ? "none" : "1px solid rgba(var(--accent-rgb),0.08)",
          borderTop: isMobile ? "1px solid rgba(var(--accent-rgb),0.08)" : "none",
          paddingLeft: isMobile ? "0" : "clamp(20px, 3vw, 48px)",
          paddingTop: isMobile ? "24px" : "40px",
        }}>
          <span className="desc-reveal" style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--accent-color)", marginBottom: "18px" }}>
            Product Details
          </span>
          {details.map((d) => (
            <div key={d.label} className="desc-reveal" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", paddingBottom: "12px", marginBottom: "12px", borderBottom: "1px solid var(--border-muted)" }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", flexShrink: 0 }}>
                {d.label}
              </span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "13px", color: "var(--text-color)", textAlign: "right" }}>
                {d.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────
function Footer({ isMobile }) {
  return (
    <footer style={{
      borderTop: "1px solid rgba(var(--accent-rgb),0.1)",
      padding: isMobile ? "24px 20px" : "32px 40px",
      // On mobile add bottom clearance for the sticky CTA bar (~72px)
      paddingBottom: isMobile ? "88px" : "32px",
      display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "16px", color: "var(--white-or-black)", letterSpacing: "-0.02em" }}>ECOMFY</span>
        <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "12px", color: "rgba(var(--accent-rgb),0.5)" }}>— style meets comfort</span>
      </div>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
        © 2026 ECOMFY. All rights reserved.
      </span>
    </footer>
  );
}

// ── Inline icon helpers ───────────────────────────────────────────────
function CartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}
function CartCheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3,8 6.5,11.5 13,4.5" strokeLinecap="square" />
    </svg>
  );
}

// ── Variant Card Component (DB variants only) ─────────────────────────
function VariantCard({ variant, product, isMobile, isSelected, onSelect }) {
  const [addedToCart, setAddedToCart] = useState(false);
  const isOutOfStock = variant.stock <= 0;
  const mainImg = variant.images?.[0]?.url || product.images?.[0]?.url;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2200);
  };

  const variantPriceAmount = (variant.price && variant.price.amount > 0) ? variant.price.amount : product.price.amount;
  const variantPriceCurrency = (variant.price && variant.price.currency) ? variant.price.currency : product.price.currency;

  return (
    <div
      onClick={onSelect}
      style={{
        background: "#141414",
        border: isSelected ? "2px solid #F5C518" : "1px solid rgba(255,255,255,0.05)",
        padding: "16px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        transition: "border-color 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.borderColor = "rgba(var(--accent-rgb),0.4)";
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.borderColor = "var(--border-muted)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Image */}
      <div style={{ width: "100%", aspectRatio: "4/5", background: "#0a0a0a", overflow: "hidden", border: "1px solid rgba(255,255,255,0.04)" }}>
        {mainImg ? (
          <img src={mainImg} alt="variant drop" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(255,255,255,0.1)" }}>
            No Image
          </div>
        )}
      </div>

      {/* Attributes & Price */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "16px", fontWeight: "800", color: "#ffffff" }}>
            {fmt(variantPriceAmount, variantPriceCurrency)}
          </span>
          <span style={{ fontSize: "11px", fontWeight: "600", color: variant.stock > 0 ? "rgba(229,226,225,0.4)" : "#ffb4ab" }}>
            {variant.stock > 0 ? `Stock: ${variant.stock}` : "SOLD OUT"}
          </span>
        </div>

        {/* Attributes list */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
          {variant.attributes && typeof variant.attributes === "object" ? (
            (() => {
              const attrs = variant.attributes instanceof Map ? Object.fromEntries(variant.attributes) : variant.attributes;
              return Object.entries(attrs).map(([key, val]) => (
                <span
                  key={key}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    padding: "2px 8px",
                    fontSize: "10px",
                    fontWeight: "700",
                    fontFamily: "'Inter', sans-serif",
                    textTransform: "uppercase",
                    color: "rgba(229,226,225,0.8)",
                  }}
                >
                  {key}: {val}
                </span>
              ));
            })()
          ) : (
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>Standard</span>
          )}
        </div>

        {/* Individual Add to Cart button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          style={{
            width: "100%",
            padding: "10px 14px",
            background: isOutOfStock ? "#333333" : addedToCart ? "#1a1a1a" : "#F5C518",
            color: isOutOfStock ? "rgba(255,255,255,0.3)" : addedToCart ? "#F5C518" : "#0a0a0a",
            border: isOutOfStock ? "1px solid #333333" : "1px solid #F5C518",
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 800,
            fontSize: "10px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            cursor: isOutOfStock ? "not-allowed" : "pointer",
            outline: "none",
            transition: "background 0.3s, color 0.3s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px"
          }}
        >
          {isOutOfStock ? "OUT OF STOCK" : addedToCart ? (<><CartCheckIcon /> Added</>) : (<><CartIcon /> Buy Variant</>)}
        </button>
      </div>
    </div>
  );
}

// ── Variants Section (DB variants only) ───────────────────────────────
function VariantsSection({ product, selectedVariant, onSelectVariant, isMobile }) {
  if (!product.variant || product.variant.length === 0) return null;

  return (
    <section
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: isMobile ? "40px 20px" : "60px 40px",
        borderTop: "1px solid rgba(var(--accent-rgb),0.12)",
      }}
    >
      <span
        style={{
          display: "block",
          fontFamily: "'Inter', sans-serif",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "var(--accent-color)",
          marginBottom: "14px",
        }}
      >
        Available Drops
      </span>
      <h2
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 900,
          fontSize: isMobile ? "24px" : "32px",
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          color: "#fff",
          margin: "0 0 32px 0",
        }}
      >
        Select Variant
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "24px",
        }}
      >
        {product.variant.map((v, idx) => {
          const isSelected = selectedVariant && selectedVariant._id === v._id;
          return (
            <VariantCard
              key={v._id || idx}
              variant={v}
              product={product}
              isMobile={isMobile}
              isSelected={isSelected}
              onSelect={() => onSelectVariant && onSelectVariant(v)}
            />
          );
        })}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════
// ── MAIN PAGE
// ══════════════════════════════════════════════════════════════════════
export default function ProductDetail() {
  const { id } = useParams();
  const { fetchProductById } = useProduct();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const reduxProduct = useSelector((s) => s.product.currentProduct);
  const loading = useSelector((s) => s.product.loading);
  const { isMobile, isTablet } = useBreakpoint();
  const { items } = useSelector((s) => s.cart);
  const totalQty = items.reduce((acc, it) => acc + (it.quantity || 0), 0);
  console.log("totalQty", totalQty);
  console.log("items", items);
  // console.log(reduxProduct);
  const product = reduxProduct || [];

  // Track selected variant attributes for real DB variants
  const [selectedAttrs, setSelectedAttrs] = useState({});

  const isDbVariants = product.variant && product.variant.length > 0 && (product.variant[0].attributes !== undefined || product.variant[0].stock !== undefined);

  // Pre-select first variant on product load
  useEffect(() => {
    if (isDbVariants) {
      const firstVar = product.variant?.[0];
      if (firstVar && firstVar.attributes) {
        const attrs = firstVar.attributes instanceof Map ? Object.fromEntries(firstVar.attributes) : firstVar.attributes;
        const initialSelected = {};
        Object.entries(attrs).forEach(([key, val]) => {
          initialSelected[key.toLowerCase()] = val;
        });
        setSelectedAttrs((prev) => {
          const keys1 = Object.keys(prev);
          const keys2 = Object.keys(initialSelected);
          if (keys1.length === keys2.length && keys1.every((k) => prev[k] === initialSelected[k])) {
            return prev;
          }
          return initialSelected;
        });
      }
    } else {
      setSelectedAttrs((prev) => {
        if (Object.keys(prev).length === 0) return prev;
        return {};
      });
    }
  }, [product, isDbVariants]);

  // Find currently selected variant object
  const selectedVariant = isDbVariants
    ? product.variant.find((v) => {
        if (!v.attributes) return false;
        const attrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes;
        return Object.entries(selectedAttrs).every(([key, val]) => {
          return attrs[key.toLowerCase()] === val;
        });
      })
    : null;

  // Dynamically prepare image list: variant images take priority when a variant is selected
  let displayImages = product.images || [];
  if (selectedVariant) {
    if (selectedVariant.images && selectedVariant.images.length > 0) {
      // Prepend variant images then append product images as additional shots
      displayImages = [...selectedVariant.images];
    } else if (selectedVariant.images) {
      // Backward-compat: old single image field
      displayImages = [...selectedVariant.images];
    }
  }

  // Load fonts
  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (id) fetchProductById(id);
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-color)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid rgba(var(--accent-rgb),0.15)", borderTop: "3px solid var(--accent-color)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(var(--accent-rgb),0.5)" }}>
            Loading drop…
          </span>
        </div>
      </div>
    );
  }

  const sectionPadding = isMobile ? "32px 20px" : isTablet ? "40px 28px" : "56px 40px";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-color)", color: "var(--text-color)", overflowX: "hidden", fontFamily: "'Inter', sans-serif" }}>
      <NavBar user={user} navigate={navigate} totalQty={totalQty}/>
      <TickerTape />

      {/* ── Hero Section */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: sectionPadding }}>
        {/* Back link */}
        <div style={{ marginBottom: isMobile ? "20px" : "32px" }}>
          <Link
            to="/"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(var(--accent-rgb),0.6)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-color)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(var(--accent-rgb),0.6)")}
          >
            ← Back to drops
          </Link>
        </div>

        {/* Two-column on desktop/tablet, single column on mobile */}
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: "0",
          alignItems: isMobile ? "stretch" : "flex-start",
        }}>
          <ImageGallery images={displayImages} isMobile={isMobile} />
          <ProductInfo
            product={product}
            isMobile={isMobile}
            selectedAttrs={selectedAttrs}
            setSelectedAttrs={setSelectedAttrs}
            selectedVariant={selectedVariant}
            isDbVariants={isDbVariants}
          />
        </div>
      </section>

      {/* Description */}
      <DescriptionSection product={product} isMobile={isMobile} />

      <Footer isMobile={isMobile} />

      {/* Mobile sticky bottom bar */}
      {isMobile && (
        <MobileStickyBar
          product={product}
          selectedVariant={selectedVariant}
          isDbVariants={isDbVariants}
          productId={product._id}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { height: 3px; background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(var(--accent-rgb),0.25); }
        /* Remove tap highlight on mobile buttons */
        button { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}
