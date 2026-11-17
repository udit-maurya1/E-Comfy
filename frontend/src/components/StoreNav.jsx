import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { gsap } from "gsap";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useAuth } from "../features/auth/hooks/useAuth";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = ["Shop", "Drops", "Sellers"];

const initials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/**
 * The storefront navbar, shared by every customer-facing page.
 *
 * `greeting` shows the "Hey, <name>" line the home page uses; pages that want a
 * denser header (cart, checkout) leave it off.
 */
export default function StoreNav({ greeting = false }) {
  const navRef = useRef(null);
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const user = useSelector((s) => s.auth.user);
  const totalQty = useSelector((s) => s.cart.totalQuantity);
  const wishlistCount = useSelector((s) => s.wishlist.items.length);
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleLogout } = useAuth();

  const onLogout = async () => {
    setMenuOpen(false);
    await handleLogout();
    navigate("/login");
  };

  useEffect(() => {
    // fromTo, not from: StrictMode runs effects twice in dev, and `from` reads
    // the element's *current* position as its destination — on the second run
    // that's the mid-flight value of the first tween, so the nav animates from
    // -70 to -70 and never visibly moves. Explicit start and end values make
    // the tween idempotent, and the context revert kills run 1 before run 2.
    const ctx = gsap.context(() => {
      gsap.fromTo(
        navRef.current,
        { y: -70 },
        {
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          clearProps: "transform",
        },
      );
    }, navRef);

    return () => ctx.revert();
  }, []);

  // The dropdown is mobile-only — a resize to desktop should close it, not
  // leave it stranded open.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  return (
    <>
      <nav
        ref={navRef}
        className={`position-sticky top-0 z-50 bg-nav-bg backdrop-blur-md border-b border-surface-border flex items-center justify-between px-8 h-16${isMobile ? " px-4" : ""}`}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--nav-bg)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid var(--surface-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "0 16px" : "0 32px",
          height: "64px",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: isMobile ? "18px" : "22px",
              letterSpacing: "-0.03em",
              color: "var(--white-or-black)",
            }}
          >
            ECOMFY
          </span>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "11px",
              color: "var(--accent-color)",
              letterSpacing: "0.1em",
              marginTop: "4px",
            }}
          >
            ™
          </span>
        </Link>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            {NAV_LINKS.map((label) => (
              <span
                key={label}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--nav-link-color)",
                  cursor: "pointer",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--accent-color)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--nav-link-color)")
                }
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Right cluster */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <ThemeToggle />

          {user && !isMobile && (
            <Link
              to="/orders"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--nav-link-color)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--accent-color)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--nav-link-color)")
              }
            >
              Orders
            </Link>
          )}

          {/* Wishlist — available signed out too, backed by localStorage */}
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-color)"
              strokeWidth="1.8"
            >
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.7-7.7 1.1-1.1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
            {wishlistCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-8px",
                  background: "var(--accent-color)",
                  color: "var(--black-or-white)",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 900,
                  fontSize: "9px",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-color)"
              strokeWidth="1.8"
            >
              <path d="M3 3h2l3.5 14h9.5l3-9H7" strokeLinecap="square" />
              <circle
                cx="9"
                cy="21"
                r="1.5"
                fill="var(--text-color)"
                stroke="none"
              />
              <circle
                cx="19"
                cy="21"
                r="1.5"
                fill="var(--text-color)"
                stroke="none"
              />
            </svg>
            {totalQty > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-8px",
                  background: "var(--accent-color)",
                  color: "var(--black-or-white)",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 900,
                  fontSize: "9px",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {totalQty}
              </span>
            )}
          </Link>

          {user ? (
            <>
              {greeting && !isMobile && (
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "13px",
                    color: "var(--text-color)",
                    letterSpacing: "0.02em",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontStyle: "italic",
                      color: "var(--accent-color)",
                    }}
                  >
                    Hey,{" "}
                  </span>
                  {user.fullname?.split(" ")[0]}
                </span>
              )}
              <div
                onClick={() =>
                  navigate(
                    user.role === "seller" ? "/seller/products" : "/orders",
                  )
                }
                style={{
                  width: "34px",
                  height: "34px",
                  background: "var(--accent-color)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 900,
                  fontSize: "13px",
                  color: "var(--black-or-white)",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {initials(user.fullname)}
              </div>
              {!isMobile && (
                <button
                  onClick={onLogout}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--surface-border)",
                    color: "var(--nav-link-color)",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    padding: "8px 14px",
                    cursor: "pointer",
                    transition: "color 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--accent-color)";
                    e.currentTarget.style.borderColor = "var(--accent-color)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--nav-link-color)";
                    e.currentTarget.style.borderColor = "var(--surface-border)";
                  }}
                >
                  Log out
                </button>
              )}
            </>
          ) : (
            <Link
              to="/login"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 800,
                fontSize: "11px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--black-or-white)",
                background: "var(--accent-color)",
                padding: isMobile ? "8px 14px" : "9px 20px",
                textDecoration: "none",
                transition: "box-shadow 0.25s, transform 0.2s",
                display: "inline-block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 24px rgba(var(--accent-rgb),0.45)";
                e.currentTarget.style.transform = "scale(1.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Login
            </Link>
          )}

          {/* Hamburger — mobile only */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                flexDirection: "column",
                gap: "5px",
              }}
            >
              <span
                style={{
                  display: "block",
                  width: "22px",
                  height: "2px",
                  background: menuOpen
                    ? "var(--accent-color)"
                    : "var(--text-color)",
                  transition: "all 0.25s",
                  transform: menuOpen
                    ? "rotate(45deg) translate(5px, 5px)"
                    : "none",
                }}
              />
              <span
                style={{
                  display: "block",
                  width: "22px",
                  height: "2px",
                  background: "var(--text-color)",
                  transition: "opacity 0.25s",
                  opacity: menuOpen ? 0 : 1,
                }}
              />
              <span
                style={{
                  display: "block",
                  width: "22px",
                  height: "2px",
                  background: menuOpen
                    ? "var(--accent-color)"
                    : "var(--text-color)",
                  transition: "all 0.25s",
                  transform: menuOpen
                    ? "rotate(-45deg) translate(5px, -5px)"
                    : "none",
                }}
              />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div
          style={{
            background: "var(--surface-color)",
            borderBottom: "1px solid var(--surface-border)",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            zIndex: 99,
            position: "relative",
          }}
        >
          {NAV_LINKS.map((label) => (
            <span
              key={label}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--nav-link-color)",
                cursor: "pointer",
                padding: "14px 0",
                borderBottom: "1px solid var(--border-muted)",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--accent-color)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--nav-link-color)")
              }
            >
              {label}
            </span>
          ))}
          {user && (
            <>
              <Link
                to="/orders"
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--nav-link-color)",
                  textDecoration: "none",
                  padding: "14px 0",
                  borderBottom: "1px solid var(--border-muted)",
                }}
              >
                My Orders
              </Link>
              <button
                onClick={onLogout}
                style={{
                  background: "transparent",
                  border: "none",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--nav-link-color)",
                  padding: "14px 0",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                Log out
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
