import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { gsap } from "gsap";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useAuth } from "../features/auth/hooks/useAuth";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { label: "Dashboard", to: "/seller/dashboard" },
  { label: "My Drops", to: "/seller/products" },
  { label: "Orders", to: "/seller/orders" },
  { label: "Add Drop", to: "/seller/add-product" },
];

const initials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/**
 * The seller studio navbar, shared by every /seller page — the counterpart to
 * StoreNav on the customer side. Sellers were previously navigating between the
 * dashboard, a listing and the add form through one-off back links.
 */
export default function SellerNav() {
  const navRef = useRef(null);
  const { pathname } = useLocation();
  const { isMobile } = useBreakpoint();
  const user = useSelector((s) => s.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { handleLogout } = useAuth();

  const onLogout = async () => {
    setMenuOpen(false);
    await handleLogout();
    navigate("/login");
  };

  useEffect(() => {
    // fromTo, not from — see the note in StoreNav: `from` reads the current
    // position as its destination, which StrictMode's double effect turns into
    // a no-op tween.
    const ctx = gsap.context(() => {
      gsap.fromTo(
        navRef.current,
        { y: -70 },
        { y: 0, duration: 0.9, ease: "power3.out", clearProps: "transform" },
      );
    }, navRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  // A nested route (/seller/product/:id, /seller/orders/:id) should still light
  // up the section it belongs to.
  const isActive = (to) =>
    to === "/seller/products"
      ? pathname.startsWith("/seller/product")
      : pathname.startsWith(to);

  const linkStyle = (active) => ({
    fontFamily: "'Inter', sans-serif",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: active ? "var(--accent-color)" : "var(--nav-link-color)",
    textDecoration: "none",
    paddingBottom: "3px",
    borderBottom: active
      ? "1.5px solid var(--accent-color)"
      : "1.5px solid transparent",
    transition: "color 0.2s",
  });

  return (
    <>
      <nav
        ref={navRef}
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
          to="/seller/products"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "baseline",
            gap: "8px",
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
          {!isMobile && (
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: "12px",
                color: "var(--accent-color)",
                letterSpacing: "0.06em",
              }}
            >
              — seller studio
            </span>
          )}
        </Link>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            {NAV_LINKS.map(({ label, to }) => (
              <Link key={to} to={to} style={linkStyle(isActive(to))}>
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* Right cluster */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <ThemeToggle />

          {!isMobile && (
            <Link
              to="/"
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
              Storefront
            </Link>
          )}

          {user && !isMobile && (
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

          {user && (
            <div
              title={user.fullname}
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
                flexShrink: 0,
              }}
            >
              {initials(user.fullname)}
            </div>
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
            padding: "8px 20px 16px",
            display: "flex",
            flexDirection: "column",
            zIndex: 99,
            position: "relative",
          }}
        >
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: isActive(to)
                  ? "var(--accent-color)"
                  : "var(--nav-link-color)",
                textDecoration: "none",
                padding: "14px 0",
                borderBottom: "1px solid var(--border-muted)",
              }}
            >
              {label}
            </Link>
          ))}
          <Link
            to="/"
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
            Storefront
          </Link>
          {user && (
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
          )}
        </div>
      )}
    </>
  );
}
