import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProduct } from "../hooks/useProduct";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import StoreNav from "../../../components/StoreNav";
import WishlistButton from "../../wishlist/components/WishlistButton";

gsap.registerPlugin(ScrollTrigger);

// ── Fonts ──────────────────────────────────────────────────────────
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap";

// ── Helpers ────────────────────────────────────────────────────────
const CURRENCY = { INR: "₹", USD: "$", EUR: "€", GBP: "£", JPY: "¥" };

// const PRODUCTS_PER_PAGE = 12;

// ═══════════════════════════════════════════════════════════════════
export default function Home() {

  const {fetchAllProducts,fetchProductById} = useProduct();

  const products = useSelector((s) => s.product.allProducts);
  const loading  = useSelector((s) => s.product.loading);

  const totalPages = useSelector((s) => s.product.totalPages);
  const [currentPage, setCurrentPage] = useState(1);
  const { isMobile } = useBreakpoint();

  // ── Refs ───────────────────────────────────────────────────────
  const pageRef      = useRef(null);
  const heroRef      = useRef(null);
  const heroLine1    = useRef(null);
  const heroLine2    = useRef(null);
  const heroDivider  = useRef(null);
  const heroBadge    = useRef(null);
  const gridRef      = useRef(null);
  const paginRef     = useRef(null);
  const tickerRef    = useRef(null);

  // ── Load fonts ─────────────────────────────────────────────────
  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  // ── Fetch products ─────────────────────────────────────────────
  // Session bootstrap lives in App, which calls /auth/me once for the whole
  // app. Calling it here too fetched the session a second time on first paint
  // and again on every page change, for a value this page never reads.
  useEffect(() => {
    fetchAllProducts(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // ── GSAP: entrance animations ──────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      // The navbar animates itself — see StoreNav.

      // Hero text cascade
      const heroEls = [heroBadge.current, heroLine1.current, heroLine2.current, heroDivider.current];
      gsap.set(heroEls, { y: 60, opacity: 0 });
      gsap.to(heroEls, {
        y: 0, opacity: 1, duration: 0.8,
        stagger: 0.15, ease: "power3.out", delay: 0.4,
      });

      // Ticker tape infinite scroll
      if (tickerRef.current) {
        gsap.to(tickerRef.current, {
          x: "-50%", duration: 20, ease: "none", repeat: -1,
        });
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // ── GSAP: card reveal on each page load ────────────────────────
  // Identifies the set of cards actually on screen rather than the array that
  // holds them: every fetch returns a new array even for the same page, so
  // depending on `products` alone replayed the reveal on identical data.
  const revealedSet = useRef(null);

  useEffect(() => {
    if (loading || !gridRef.current || !products.length) return;

    const setKey = `${products[0]?._id}:${products.length}`;
    if (revealedSet.current === setKey) return;
    revealedSet.current = setKey;

    const cards = gridRef.current.querySelectorAll(".h-card");
    gsap.fromTo(
      cards,
      { y: 50, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.55,
        stagger: 0.06, ease: "power2.out",
      }
    );
  }, [loading, products]);

  // ── Pagination ─────────────────────────────────────────────────
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
    window.scrollTo({ top: heroRef.current?.offsetTop + heroRef.current?.offsetHeight - 40 || 400, behavior: "smooth" });
  };

  // ── Ticker text ────────────────────────────────────────────────
  const TICKER_TEXT = "NEW DROP  ·  EXCLUSIVE STYLES  ·  FREE SHIPPING ABOVE ₹999  ·  ECOMFY SS25  ·  STYLE MEETS COMFORT  ·  ";

  // ═══════════════════════ JSX ════════════════════════════════════
  return (
    <div
      ref={pageRef}
      style={{
        minHeight: "100vh",
        background: "var(--bg-color)",
        fontFamily: "'Inter', sans-serif",
        overflowX: "hidden",
        color: "var(--text-color)",
      }}
    >

      {/* ══════════ NAVBAR ══════════════════════════════════════════ */}
      <StoreNav greeting />

      {/* ══════════ TICKER TAPE ═══════════════════════════════════════ */}
      <div
        style={{
          background: "var(--accent-color)",
          overflow: "hidden",
          whiteSpace: "nowrap",
          padding: "8px 0",
        }}
      >
        <span
          ref={tickerRef}
          style={{
            display: "inline-block",
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 800,
            fontSize: "11px",
            letterSpacing: "0.2em",
            color: "var(--black-or-white)",
          }}
        >
          {TICKER_TEXT.repeat(8)}
        </span>
      </div>

      {/* ══════════ HERO ══════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          padding: isMobile ? "48px 20px 40px" : "72px 40px 64px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Decorative corner */}
        <div
          style={{
            position: "absolute",
            top: isMobile ? "20px" : "40px",
            right: isMobile ? "20px" : "40px",
            width: isMobile ? "40px" : "60px",
            height: isMobile ? "40px" : "60px",
            border: "2px solid rgba(var(--accent-rgb),0.22)",
            borderLeft: "none",
            borderBottom: "none",
          }}
        />

        {/* Badge */}
        <div
          ref={heroBadge}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              background: "var(--accent-color)",
              borderRadius: "50%",
              animation: "pulse 1.6s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "var(--accent-color)",
            }}
          >
            SS 2025 Collection
          </span>
        </div>

        {/* Hero headline */}
        <h1 ref={heroLine1} style={{ margin: 0, lineHeight: 1, marginBottom: "8px" }}>
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(44px, 8vw, 96px)",
              letterSpacing: "-0.04em",
              color: "var(--white-or-black)",
              display: "block",
            }}
          >
            THE DROP
          </span>
        </h1>
        <h2 ref={heroLine2} style={{ margin: 0, lineHeight: 1, marginBottom: "32px" }}>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "clamp(44px, 8vw, 96px)",
              letterSpacing: "-0.02em",
              color: "var(--accent-color)",
              display: "block",
            }}
          >
            is Live.
          </span>
        </h2>

        {/* Sub */}
        <div ref={heroDivider} style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? "12px" : "20px" }}>
          {!isMobile && <div style={{ width: "48px", height: "2px", background: "var(--accent-color)" }} />}
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "15px",
              color: "var(--text-muted)",
              margin: 0,
              letterSpacing: "0.02em",
            }}
          >
            Browse the latest styles —{" "}
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                color: "var(--gold-text)",
              }}
            >
              curated, exclusive, unapologetic.
            </span>
          </p>
        </div>
      </section>

      {/* ══════════ PRODUCT SECTION ════════════════════════════════════ */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: isMobile ? "0 16px 48px" : "0 40px 80px" }}>

        {/* Section label */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            marginBottom: "32px",
            paddingBottom: "20px",
            borderBottom: "1px solid rgba(var(--accent-rgb),0.1)",
            gap: isMobile ? "12px" : "0",
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--accent-color)",
                display: "block",
                marginBottom: "4px",
              }}
            >
              All Products
            </span>
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: "22px",
                color: "var(--text-color)",
              }}
            >
              {loading ? "Loading…" : `${products.length === 0 ? "No" : "Showing"} drops`}
            </span>
          </div>
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: "12px",
              letterSpacing: "0.08em",
              color: "var(--text-muted)",
            }}
          >
            PAGE {currentPage} / {totalPages}
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <LoadingSkeleton isMobile={isMobile} />
        ) : products.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            ref={gridRef}
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(240px, 1fr))",
              gap: isMobile ? "16px" : "24px",
            }}
          >
            {products.map((product) => (
              <ProductCard key={product._id} product={product} isMobile={isMobile} fetchProductById={fetchProductById}/>
            ))}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div
            ref={paginRef}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "56px",
            }}
          >
            {/* Prev */}
            <PaginBtn
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
              label="←"
              isArrow
            />

            {/* Page numbers */}
            {buildPageNums(currentPage, totalPages).map((p, i) =>
              p === "…" ? (
                <span
                  key={`ellipsis-${i}`}
                  style={{
                    padding: "0 6px",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "13px",
                    color: "rgba(229,226,225,0.3)",
                  }}
                >
                  …
                </span>
              ) : (
                <PaginBtn
                  key={p}
                  label={p}
                  active={p === currentPage}
                  onClick={() => goToPage(p)}
                />
              )
            )}

            {/* Next */}
            <PaginBtn
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
              label="→"
              isArrow
            />
          </div>
        )}
      </section>

      {/* ══════════ FOOTER ════════════════════════════════════════════ */}
      <footer
        style={{
          borderTop: "1px solid rgba(var(--accent-rgb),0.1)",
          padding: "32px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: "16px",
              color: "var(--white-or-black)",
              letterSpacing: "-0.02em",
            }}
          >
            ECOMFY
          </span>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "12px",
              color: "rgba(var(--accent-rgb),0.5)",
            }}
          >
            — style meets comfort
          </span>
        </div>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "11px",
            color: "rgba(229,226,225,0.22)",
            letterSpacing: "0.06em",
          }}
        >
          © 2026 ECOMFY. All rights reserved.
        </span>
      </footer>

      {/* Pulse keyframe */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}

// ── ProductCard ────────────────────────────────────────────────────
function ProductCard({ product, isMobile,fetchProductById}) {
  const cardRef   = useRef(null);
  const navigate  = useNavigate();
  const symbol    = CURRENCY[product.price?.currency] || "₹";
  const mainImage = product.images?.[0]?.url;

  const enter = () => {
    gsap.to(cardRef.current, { y: -6, duration: 0.25, ease: "power2.out" });
    gsap.to(cardRef.current.querySelector(".card-glow"), { opacity: 1, duration: 0.25 });
    gsap.to(cardRef.current.querySelector(".card-img img"), { scale: 1.06, duration: 0.5, ease: "power2.out" });
  };
  const leave = () => {
    gsap.to(cardRef.current, { y: 0, duration: 0.25, ease: "power2.out" });
    gsap.to(cardRef.current.querySelector(".card-glow"), { opacity: 0, duration: 0.25 });
    gsap.to(cardRef.current.querySelector(".card-img img"), { scale: 1, duration: 0.4, ease: "power2.out" });
  };

  return (
    <div
      ref={cardRef}
      className="h-card"
      onMouseEnter={enter}
      onMouseLeave={leave}
      onClick={() => {
        fetchProductById(product._id);
        navigate(`/product/${product._id}`)
      }}
      style={{
        position: "relative",
        background: "var(--card-bg)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.3s",
      }}
    >
      {/* Gold border glow on hover */}
      <div
        className="card-glow"
        style={{
          position: "absolute",
          inset: 0,
          border: "1.5px solid var(--accent-color)",
          pointerEvents: "none",
          opacity: 0,
          zIndex: 2,
        }}
      />

      {/* Save to wishlist — stops the click from opening the product */}
      <WishlistButton product={product} />

      {/* Image */}
      <div
        className="card-img"
        style={{
          width: "100%",
          aspectRatio: "3/4",
          background: "#1a1a1a",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {mainImage ? (
          <img
            src={mainImage}
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
              color: "rgba(var(--accent-rgb),0.18)",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
              <rect x="3" y="3" width="18" height="18" rx="1" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {/* Seller badge */}
        {product.seller?.fullname && (
          <div
            style={{
              position: "absolute",
              bottom: "8px",
              left: "8px",
              background: "",
              backdropFilter: "blur(6px)",
              padding: "3px 8px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "9px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--black-or-white)",
            }}
          >
            {product.seller.fullname.split(" ")[0]}
          </div>
        )}

        {/* Drop badge */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            background: "var(--accent-color)",
            color: "var(--black-or-white)",
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "8px",
            fontWeight: 800,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            padding: "3px 7px",
            zIndex: 1,
          }}
        >
          DROP
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: isMobile ? "10px 12px 14px" : "14px 16px 18px",
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? "6px" : "8px",
          flex: 1,
        }}
      >
        <h3
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            fontSize: isMobile ? "12px" : "13px",
            letterSpacing: "0.01em",
            color: "#e5e2e1",
            margin: 0,
            lineHeight: 1.35,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {product.title}
        </h3>
        {product.description && !isMobile && (
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "11px",
              color: "var(--text-muted)",
              margin: 0,
              lineHeight: 1.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {product.description}
          </p>
        )}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: isMobile ? "16px" : "19px",
              color: "var(--accent-color)",
              letterSpacing: "-0.01em",
            }}
          >
            {symbol}{Number(product.price?.amount).toLocaleString("en-IN")}
          </span>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "11px",
              color: "rgba(var(--accent-rgb),0.45)",
            }}
          >
            {product.price?.currency || "INR"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Pagination button ──────────────────────────────────────────────
function PaginBtn({ label, active, disabled, onClick, isArrow }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: isArrow ? "40px" : "38px",
        height: "38px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: active ? "var(--accent-color)" : "transparent",
        border: active
          ? "1.5px solid var(--accent-color)"
          : disabled
          ? "1.5px solid var(--border-muted)"
          : "1.5px solid var(--border-muted)",
        color: active
          ? "var(--black-or-white)"
          : disabled
          ? "var(--text-muted)"
          : "var(--text-color)",
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: active ? 800 : 600,
        fontSize: isArrow ? "16px" : "12px",
        letterSpacing: isArrow ? 0 : "0.04em",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!active && !disabled)
          e.currentTarget.style.borderColor = "var(--accent-color)";
      }}
      onMouseLeave={(e) => {
        if (!active && !disabled)
          e.currentTarget.style.borderColor = "var(--border-muted)";
      }}
    >
      {label}
    </button>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────
function LoadingSkeleton({ isMobile }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(240px, 1fr))",
        gap: isMobile ? "16px" : "24px",
      }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{ background: "#141414", aspectRatio: "3/5", animation: "shimmer 1.4s ease infinite" }}
        >
          <style>{`
            @keyframes shimmer {
              0%   { opacity: 0.4; }
              50%  { opacity: 0.7; }
              100% { opacity: 0.4; }
            }
          `}</style>
        </div>
      ))}
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        padding: "80px 24px",
        border: "2px dashed rgba(var(--accent-rgb),0.1)",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: "18px",
          color: "rgba(229,226,225,0.3)",
          margin: 0,
        }}
      >
        No drops available yet.
      </p>
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "12px",
          color: "rgba(229,226,225,0.18)",
          letterSpacing: "0.1em",
        }}
      >
        Check back soon — the next drop is brewing.
      </span>
    </div>
  );
}

// ── Page number builder ────────────────────────────────────────────
function buildPageNums(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (current > 3) pages.push("…");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}
