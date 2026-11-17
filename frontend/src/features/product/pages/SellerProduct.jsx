import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProduct } from "../hooks/useProduct";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import { useNavigate } from "react-router";
import SellerNav from "../../../components/SellerNav";

gsap.registerPlugin(ScrollTrigger);

// ── Google Fonts ─────────────────────────────────────────────────
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap";

// ── Currency symbol helper ───────────────────────────────────────
const CURRENCY_SYMBOLS = { INR: "₹", USD: "$", EUR: "€", GBP: "£", JPY: "¥" };

// ── Avatar initials helper ───────────────────────────────────────
function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ═══════════════════════════════════════════════════════════════
export default function SellerProduct() {
  const user     = useSelector((s) => s.auth.user);
  const products = useSelector((s) => s.product.sellerProducts);
  const { fetchSellerProducts } = useProduct();
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();

  // ── Refs ──────────────────────────────────────────────────────
  const pageRef       = useRef(null);
  const profileRef    = useRef(null);
  const dividerRef    = useRef(null);
  const sectionHdRef  = useRef(null);
  const gridRef       = useRef(null);

  // ── Load fonts ────────────────────────────────────────────────
  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
      const link = document.createElement("link");
      link.rel  = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  // ── Fetch products on mount ───────────────────────────────────
  useEffect(() => {
    fetchSellerProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── GSAP header entrance ──────────────────────────────────────
  // Mount only. This used to depend on [products], which meant every arriving
  // product list re-hid the header and replayed the whole entrance — and the
  // list arrives more than once (see the card effect below).
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial hidden
      gsap.set(profileRef.current,   { y: -40, opacity: 0 });
      gsap.set(dividerRef.current,   { scaleX: 0, transformOrigin: "left center" });
      gsap.set(sectionHdRef.current, { y: 20, opacity: 0 });

      // Entrance timeline
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .to(profileRef.current,   { y: 0, opacity: 1, duration: 0.75 })
        .to(dividerRef.current,   { scaleX: 1, duration: 0.6, ease: "power4.inOut" }, "-=0.3")
        .to(sectionHdRef.current, { y: 0, opacity: 1, duration: 0.55 }, "-=0.25");
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // ── Grid cards scroll reveal ──────────────────────────────────
  // Keyed on the card count, not the array: every fetch hands back a brand new
  // array even when the products are identical, so [products] re-fired on data
  // that hadn't changed. Cards already revealed are marked and skipped, so a
  // later fetch can't drop them back to opacity 0.
  useEffect(() => {
    if (!gridRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gridRef.current.querySelectorAll(
        ".product-card:not([data-revealed])",
      );
      cards.forEach((card, i) => {
        card.dataset.revealed = "true";
        gsap.fromTo(
          card,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            delay: i * 0.07,
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, pageRef);

    return () => ctx.revert();
  }, [products.length]);

  // ── Card hover ────────────────────────────────────────────────
  const onCardEnter = (el) => {
    gsap.to(el, { y: -4, duration: 0.25, ease: "power2.out" });
    gsap.to(el.querySelector(".card-border"), { opacity: 1, duration: 0.25 });
  };
  const onCardLeave = (el) => {
    gsap.to(el, { y: 0, duration: 0.25, ease: "power2.out" });
    gsap.to(el.querySelector(".card-border"), { opacity: 0, duration: 0.25 });
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div
      ref={pageRef}
      style={{
        minHeight: "100vh",
        background: "var(--bg-color)",
        color: "var(--text-color)",
        fontFamily: "'Inter', sans-serif",
        overflowX: "hidden",
      }}
    >
      <SellerNav />

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: isMobile ? "24px 16px 48px" : "48px 32px 80px" }}>

        {/* ══════════ SELLER PROFILE CARD ══════════ */}
        <div
          ref={profileRef}
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            textAlign: isMobile ? "center" : "left",
            gap: isMobile ? "20px" : "24px",
            background: "var(--card-bg)",
            padding: isMobile ? "24px 16px" : "28px 32px",
            marginBottom: "36px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Gold left-edge accent */}
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", background: "var(--accent-color)" }} />

          {/* Avatar */}
          <div
            style={{
              flexShrink: 0,
              width: "72px",
              height: "72px",
              background: "var(--accent-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: "900",
              fontSize: "26px",
              color: "var(--black-or-white)",
              letterSpacing: "-0.02em",
              userSelect: "none",
            }}
          >
            {user ? getInitials(user.fullname) : "?"}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0, width: isMobile ? "100%" : "auto" }}>
            {/* Name row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: "12px", flexWrap: "wrap", marginBottom: "4px" }}>
              <h1
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: "800",
                  fontSize: "clamp(18px, 3vw, 26px)",
                  color: "var(--white-or-black)",
                  margin: 0,
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.fullname || "Seller Name"}
              </h1>
              {/* Role badge */}
              <span
                style={{
                  flexShrink: 0,
                  background: "var(--accent-color)",
                  color: "var(--black-or-white)",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "9px",
                  fontWeight: "700",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  padding: "3px 8px",
                }}
              >
                {user?.role?.toUpperCase() || "SELLER"}
              </span>
            </div>

            {/* Email */}
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                color: "var(--text-muted)",
                margin: isMobile ? "0 0 12px" : "0 0 16px",
              }}
            >
              {user?.email || "—"}
            </p>

            {/* Stats row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: isMobile ? "20px" : "32px" }}>
              <div>
                <div
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: "800",
                    fontSize: "22px",
                    color: "var(--accent-color)",
                    lineHeight: 1,
                  }}
                >
                  {products.length}
                </div>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "10px",
                    fontWeight: "700",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(209,197,172,0.38)",
                    marginTop: "4px",
                  }}
                >
                  Total Drops
                </div>
              </div>
              {!isMobile && <div style={{ width: "1px", height: "36px", background: "rgba(var(--accent-rgb),0.15)" }} />}
              <div>
                <div
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: "800",
                    fontSize: "22px",
                    color: "var(--accent-color)",
                    lineHeight: 1,
                  }}
                >
                  {products.filter(p => p.images?.length > 0).length}
                </div>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "10px",
                    fontWeight: "700",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginTop: "4px",
                  }}
                >
                  With Images
                </div>
              </div>
            </div>
          </div>

          {/* Corner bracket — decorative */}
          {!isMobile && (
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                width: "28px",
                height: "28px",
                border: "1.5px solid rgba(var(--accent-rgb),0.25)",
                borderLeft: "none",
                borderBottom: "none",
              }}
            />
          )}
        </div>

        {/* ══════════ GOLD DIVIDER ══════════ */}
        <div
          ref={dividerRef}
          style={{ height: "1px", background: "rgba(var(--accent-rgb),0.18)", marginBottom: "36px" }}
        />

        {/* ══════════ SECTION HEADER ══════════ */}
        <div
          ref={sectionHdRef}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isMobile ? "center" : "space-between",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "32px",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          <div style={{ width: isMobile ? "100%" : "auto" }}>
            <span
              style={{
                display: "block",
                fontFamily: "'Inter', sans-serif",
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--accent-color)",
                marginBottom: "4px",
              }}
            >
              SELLER STUDIO
            </span>
            <h2
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: "800",
                fontSize: "clamp(20px, 4vw, 30px)",
                color: "var(--white-or-black)",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              MY DROPS
            </h2>
          </div>

          {/* Add button */}
          <Link
            to="/seller/add-product"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: "var(--accent-color)",
              color: "var(--black-or-white)",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: "800",
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textDecoration: "none",
              padding: "12px 20px",
              transition: "box-shadow 0.25s, transform 0.25s",
              width: isMobile ? "100%" : "auto",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 0 28px rgba(245,197,24,0.4)";
              e.currentTarget.style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            ADD NEW DROP
          </Link>
        </div>

        {/* ══════════ PRODUCT GRID ══════════ */}
        {products.length === 0 ? (

          /* ── Empty state ── */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              padding: "80px 24px",
              border: "2px dashed rgba(var(--accent-rgb),0.18)",
              background: "var(--card-bg)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                border: "1.5px solid rgba(var(--accent-rgb),0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-color)",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="1" />
                <path d="M8 21h8M12 17v4" />
                <path d="M9 9h6M12 6v6" />
              </svg>
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: "700",
                  fontSize: "16px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--white-or-black)",
                  margin: "0 0 8px",
                }}
              >
                No drops yet
              </p>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  color: "var(--text-muted)",
                  margin: 0,
                }}
              >
                You haven't listed any products. Start your first drop.
              </p>
            </div>
            <Link
              to="/seller/add-product"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: "700",
                fontSize: "11px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--accent-color)",
                textDecoration: "none",
                borderBottom: "1px solid rgba(var(--accent-rgb),0.4)",
                paddingBottom: "2px",
              }}
            >
              CREATE YOUR FIRST DROP →
            </Link>
          </div>

        ) : (

          /* ── Product cards grid ── */
          <div
            ref={gridRef}
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(260px, 1fr))",
              gap: isMobile ? "16px" : "20px",
            }}
          >
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onMouseEnter={onCardEnter}
                onMouseLeave={onCardLeave}
                isMobile={isMobile}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ProductCard ───────────────────────────────────────────────────
function ProductCard({ product, onMouseEnter, onMouseLeave, isMobile , navigate}) {
  const cardRef = useRef(null);
  const currencySymbol = CURRENCY_SYMBOLS[product.price?.currency] || "₹";
  const mainImage = product.images?.[0]?.url;

  return (
    <div
      ref={cardRef}
      className="product-card"
      onMouseEnter={() => onMouseEnter(cardRef.current)}
      onMouseLeave={() => onMouseLeave(cardRef.current)}
      onClick={()=> navigate(`/seller/product/${product._id}`)}
      style={{
        position: "relative",
        background: "var(--card-bg)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.25s",
      }}
    >
      {/* Gold border overlay (revealed on hover via GSAP) */}
      <div
        className="card-border"
        style={{
          position: "absolute",
          inset: 0,
          border: "1.5px solid var(--accent-color)",
          pointerEvents: "none",
          opacity: 0,
          zIndex: 2,
        }}
      />

      {/* Product image */}
      <div
        style={{
          width: "100%",
          aspectRatio: "4/3",
          background: "var(--surface-color)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(var(--accent-rgb),0.2)",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="1" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {/* Image count badge */}
        {product.images?.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: "8px",
              right: "8px",
              background: "rgba(10,10,10,0.75)",
              color: "#e5e2e1",
              fontFamily: "'Inter', sans-serif",
              fontSize: "10px",
              fontWeight: "600",
              letterSpacing: "0.06em",
              padding: "3px 7px",
              backdropFilter: "blur(4px)",
            }}
          >
            +{product.images.length - 1}
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: isMobile ? "10px 12px 14px" : "16px 18px 18px", display: "flex", flexDirection: "column", gap: isMobile ? "6px" : "10px", flex: 1 }}>

        {/* Title */}
        <h3
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: "700",
            fontSize: isMobile ? "12px" : "14px",
            letterSpacing: "0.01em",
            color: "var(--text-color)",
            margin: 0,
            lineHeight: "1.35",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {product.title}
        </h3>

        {/* Description preview */}
        {product.description && !isMobile && (
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              color: "var(--text-muted)",
              margin: 0,
              lineHeight: "1.55",
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

        {/* Divider */}
        <div style={{ height: "1px", background: "var(--border-muted)", margin: "2px 0" }} />

        {/* Price + actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: "800",
              fontSize: isMobile ? "15px" : "18px",
              color: "var(--accent-color)",
              letterSpacing: "-0.01em",
            }}
          >
            {currencySymbol}{Number(product.price?.amount).toLocaleString("en-IN")}
          </span>

          {/* Currency tag */}
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "9px",
              fontWeight: "700",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              border: "1px solid var(--border-muted)",
              padding: "2px 6px",
            }}
          >
            {product.price?.currency || "INR"}
          </span>
        </div>
      </div>

      {/* NEW badge on first image */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          background: "var(--accent-color)",
          color: "var(--black-or-white)",
          fontFamily: "'Inter', sans-serif",
          fontSize: "8px",
          fontWeight: "700",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          padding: "3px 7px",
          zIndex: 1,
        }}
      >
        DROP
      </div>
    </div>
  );
}
