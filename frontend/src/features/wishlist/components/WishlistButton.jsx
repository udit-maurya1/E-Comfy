import { useRef } from "react";
import { useSelector } from "react-redux";
import { gsap } from "gsap";
import { useWishlist } from "../hooks/useWishlist";
import { selectIsWishlisted } from "../state/wishlist.slice";

/**
 * The heart. Works signed in or out — useWishlist decides whether the click
 * lands in MongoDB or localStorage.
 *
 * Three shapes: `icon` floats over a catalogue card, `full` is the labelled
 * button on the product page, `bare` is a plain square for toolbars.
 */
export default function WishlistButton({
  product,
  variantId,
  variant = "icon",
  size = 18,
}) {
  const heartRef = useRef(null);
  const { toggleItem } = useWishlist();
  const wishlisted = useSelector(selectIsWishlisted(product?._id));

  if (!product?._id) return null;

  const handleClick = (e) => {
    // Cards navigate on click; hearting one must not open it.
    e.preventDefault();
    e.stopPropagation();

    gsap
      .timeline()
      .to(heartRef.current, { scale: 0.75, duration: 0.1, ease: "power2.in" })
      .to(heartRef.current, { scale: 1, duration: 0.35, ease: "back.out(3)" });

    toggleItem(product, variantId);
  };

  const heart = (
    <svg
      ref={heartRef}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={wishlisted ? "var(--accent-color)" : "none"}
      stroke={wishlisted ? "var(--accent-color)" : "currentColor"}
      strokeWidth="1.8"
      style={{ display: "block", transition: "fill 0.2s, stroke 0.2s" }}
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.7-7.7 1.1-1.1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );

  const label = wishlisted ? "Remove from wishlist" : "Save to wishlist";

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={label}
        aria-pressed={wishlisted}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "17px 24px",
          background: "transparent",
          border: `1px solid ${wishlisted ? "var(--accent-color)" : "var(--border-muted)"}`,
          color: wishlisted ? "var(--accent-color)" : "var(--text-color)",
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 800,
          fontSize: "12px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          cursor: "pointer",
          outline: "none",
          transition: "border-color 0.2s, color 0.2s",
        }}
      >
        {heart}
        {wishlisted ? "Saved" : "Wishlist"}
      </button>
    );
  }

  if (variant === "bare") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={label}
        aria-pressed={wishlisted}
        style={{
          width: "48px",
          height: "48px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: `2px solid ${wishlisted ? "var(--accent-color)" : "var(--border-muted)"}`,
          color: "var(--text-color)",
          cursor: "pointer",
          outline: "none",
          padding: 0,
          transition: "border-color 0.2s",
        }}
      >
        {heart}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      aria-pressed={wishlisted}
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 3,
        width: "34px",
        height: "34px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(10,10,10,0.55)",
        backdropFilter: "blur(6px)",
        border: `1px solid ${wishlisted ? "var(--accent-color)" : "rgba(255,255,255,0.14)"}`,
        color: "#e5e2e1",
        cursor: "pointer",
        outline: "none",
        padding: 0,
        transition: "border-color 0.2s",
      }}
    >
      {heart}
    </button>
  );
}
