import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router";
import { gsap } from "gsap";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import StoreNav from "../../../components/StoreNav";
import { useCheckout } from "../hooks/useCheckout";
import { fmt } from "../pricing";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap";

function TickIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="var(--accent-color)" strokeWidth="2">
      <circle cx="28" cy="28" r="26" />
      <polyline points="17 29 24 36 39 21" strokeLinecap="square" />
    </svg>
  );
}

export default function OrderSuccess() {
  const { orderId } = useParams();
  const { isMobile } = useBreakpoint();
  const { currentOrder, loading } = useSelector((s) => s.order);
  const { fetchOrder } = useCheckout();
  const tickRef = useRef(null);

  useEffect(() => {
    // The order is usually already in state from the payment we just verified;
    // refetch anyway so a direct link or a refresh renders the same page.
    if (orderId && currentOrder?._id !== orderId) {
      fetchOrder(orderId);
    }
  }, [orderId]);

  useEffect(() => {
    if (tickRef.current) {
      gsap.fromTo(
        tickRef.current,
        { scale: 0.6 },
        { scale: 1, duration: 0.6, ease: "back.out(2.5)", clearProps: "transform" },
      );
    }
  }, [currentOrder]);

  const order = currentOrder;
  const currency = order?.total?.currency || "INR";
  const paid = order?.payment?.status === "paid";

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={FONT_HREF} rel="stylesheet" />

      <div style={{ minHeight: "100vh", background: "var(--bg-color)", color: "var(--text-color)" }}>
        <StoreNav />

        <div
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            padding: isMobile ? "48px 20px 80px" : "72px 48px 80px",
            textAlign: "center",
          }}
        >
          {loading && !order ? (
            <p style={{ fontFamily: "'Inter', sans-serif", color: "var(--text-muted)" }}>
              Loading your order…
            </p>
          ) : !order ? (
            <p style={{ fontFamily: "'Inter', sans-serif", color: "var(--text-muted)" }}>
              We couldn't find that order.
            </p>
          ) : (
            <>
              <div ref={tickRef} style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
                <TickIcon />
              </div>

              <h1
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 900,
                  fontSize: isMobile ? "26px" : "38px",
                  letterSpacing: "-0.03em",
                  textTransform: "uppercase",
                  color: "var(--white-or-black)",
                  margin: "0 0 10px 0",
                }}
              >
                {paid ? "Order Confirmed" : "Order Placed"}
              </h1>

              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: "italic",
                  fontSize: "15px",
                  color: "var(--text-muted)",
                  margin: "0 0 8px 0",
                }}
              >
                {paid
                  ? "Your payment went through. We're getting it packed."
                  : "We're still confirming your payment — this page updates once it settles."}
              </p>

              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12px",
                  letterSpacing: "0.1em",
                  color: "var(--accent-color)",
                  margin: "0 0 40px 0",
                }}
              >
                ORDER #{order._id.slice(-8).toUpperCase()}
              </p>

              {/* Receipt */}
              <div
                style={{
                  background: "var(--surface-color)",
                  border: "1px solid var(--surface-border)",
                  padding: isMobile ? "22px" : "28px",
                  textAlign: "left",
                  marginBottom: "28px",
                }}
              >
                {order.items?.map((item, i) => (
                  <div
                    key={`${item.product}-${i}`}
                    style={{
                      display: "flex",
                      gap: "14px",
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom: "1px solid var(--border-muted)",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "56px",
                        flexShrink: 0,
                        background: "var(--card-bg)",
                        overflow: "hidden",
                      }}
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "12px", textTransform: "uppercase", color: "var(--text-color)", margin: "0 0 3px 0" }}>
                        {item.title}
                      </p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>
                        Qty {item.quantity}
                      </p>
                    </div>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "13px", color: "var(--accent-color)" }}>
                      {fmt(item.price?.amount * item.quantity, currency)}
                    </span>
                  </div>
                ))}

                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "18px" }}>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-color)" }}>
                    Total Paid
                  </span>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "20px", color: "var(--accent-color)" }}>
                    {fmt(order.total?.amount, currency)}
                  </span>
                </div>

                <div style={{ borderTop: "1px solid var(--border-muted)", marginTop: "18px", paddingTop: "18px" }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 8px 0" }}>
                    Shipping To
                  </p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", lineHeight: 1.7, color: "var(--text-color)", margin: 0 }}>
                    {order.shippingAddress?.fullname} · {order.shippingAddress?.phone}
                    <br />
                    {[order.shippingAddress?.line1, order.shippingAddress?.line2].filter(Boolean).join(", ")}
                    <br />
                    {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                    {order.shippingAddress?.pincode}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/orders" style={{ textDecoration: "none" }}>
                  <button
                    style={{
                      padding: "15px 32px",
                      background: "var(--accent-color)",
                      color: "var(--black-or-white)",
                      border: "none",
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 900,
                      fontSize: "12px",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    My Orders
                  </button>
                </Link>
                <Link to="/" style={{ textDecoration: "none" }}>
                  <button
                    style={{
                      padding: "15px 32px",
                      background: "transparent",
                      color: "var(--text-muted)",
                      border: "1px solid var(--border-muted)",
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 800,
                      fontSize: "12px",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    Continue Shopping
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
