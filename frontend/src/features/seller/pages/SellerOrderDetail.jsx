import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import SellerNav from "../../../components/SellerNav";
import { useSellerOrders } from "../hooks/useSellerOrders";
import { fmt } from "../../checkout/pricing";
import { STATUS_COLOR, PAYMENT_COLOR, FONT_HREF } from "../orderUi";
import Pill from "../components/Pill";

const label = {
  display: "block",
  fontFamily: "'Inter', sans-serif",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  marginBottom: "8px",
};

const cardStyle = {
  background: "var(--card-bg)",
  border: "1px solid var(--border-muted)",
  padding: "24px",
};

const attributesOf = (item) => {
  const attrs = item.attributes;
  if (!attrs || typeof attrs !== "object") return [];
  return Object.entries(attrs);
};

const addressLines = (a) =>
  [
    a?.fullname,
    a?.line1,
    a?.line2,
    `${a?.city || ""}, ${a?.state || ""} ${a?.pincode || ""}`.trim(),
    a?.country,
    a?.phone ? `Phone: ${a.phone}` : null,
  ].filter(Boolean);

export default function SellerOrderDetail() {
  const { orderId } = useParams();
  const { isMobile } = useBreakpoint();
  const { currentOrder: order, loading, error } = useSelector(
    (s) => s.sellerOrder,
  );
  const { fetchSellerOrder } = useSellerOrders();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (orderId) fetchSellerOrder(orderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(
        addressLines(order?.shippingAddress).join("\n"),
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is blocked (insecure origin, denied permission) — the address
      // is on screen to copy by hand, so this isn't worth an error banner.
    }
  };

  const shell = (children) => (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-color)",
        color: "var(--text-color)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <SellerNav />
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: isMobile ? "28px 16px 64px" : "40px 32px 80px",
        }}
      >
        {children}
      </div>
    </div>
  );

  if (loading && !order) {
    return shell(
      <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
        Loading order…
      </p>,
    );
  }

  if (!order) {
    return shell(
      <>
        <h2
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 900,
            fontSize: "22px",
            textTransform: "uppercase",
            color: "var(--white-or-black)",
            margin: "0 0 12px",
          }}
        >
          Order not found
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 20px" }}>
          {error || "This order doesn't contain any of your products."}
        </p>
        <Link
          to="/seller/orders"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 800,
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--accent-color)",
            textDecoration: "none",
            borderBottom: "1px solid rgba(var(--accent-rgb),0.4)",
          }}
        >
          ← Back to orders
        </Link>
      </>,
    );
  }

  const address = order.shippingAddress || {};
  const currency = order.sellerSubtotal?.currency || "INR";

  return shell(
    <>
      {/* Back link */}
      <Link
        to="/seller/orders"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "'Inter', sans-serif",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--accent-color)",
          textDecoration: "none",
          marginBottom: "24px",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Orders
      </Link>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
          paddingBottom: "20px",
          borderBottom: "1px solid var(--surface-border)",
          marginBottom: "28px",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: isMobile ? "24px" : "32px",
              letterSpacing: "-0.02em",
              color: "var(--white-or-black)",
              margin: "0 0 10px",
            }}
          >
            #{order._id.slice(-8).toUpperCase()}
          </h1>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <Pill
              text={order.status}
              color={STATUS_COLOR[order.status] || "var(--text-muted)"}
            />
            <Pill
              text={order.payment?.status}
              color={PAYMENT_COLOR[order.payment?.status] || "var(--text-muted)"}
            />
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Placed{" "}
              {new Date(order.createdAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          style={{
            background: "transparent",
            color: "var(--white-or-black)",
            border: "2px solid var(--white-or-black)",
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 800,
            fontSize: "10px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "10px 18px",
            cursor: "pointer",
          }}
        >
          Print Slip
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.35fr 1fr",
          gap: isMobile ? "24px" : "32px",
          alignItems: "start",
        }}
      >
        {/* ── Items to pack ── */}
        <div style={cardStyle}>
          <span style={label}>Items to pack ({order.itemCount})</span>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {order.items?.map((item, i) => (
              <div
                key={`${item.product}-${i}`}
                style={{
                  display: "flex",
                  gap: "14px",
                  padding: "14px",
                  background: "var(--surface-color)",
                  border: "1px solid var(--border-muted)",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "76px",
                    background: "var(--card-bg)",
                    border: "1px solid var(--surface-border)",
                    overflow: "hidden",
                    flexShrink: 0,
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
                  <h3
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: "14px",
                      color: "var(--white-or-black)",
                      margin: "0 0 6px",
                    }}
                  >
                    {item.title}
                  </h3>

                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                    {attributesOf(item).map(([key, val]) => (
                      <span
                        key={key}
                        style={{
                          border: "1px solid var(--border-muted)",
                          padding: "2px 8px",
                          fontSize: "10px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          color: "var(--text-color)",
                        }}
                      >
                        {key}: {val}
                      </span>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Qty {item.quantity} × {fmt(item.price?.amount, item.price?.currency)}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 800,
                        fontSize: "15px",
                        color: "var(--accent-color)",
                      }}
                    >
                      {fmt(
                        (item.price?.amount || 0) * item.quantity,
                        item.price?.currency,
                      )}
                    </span>
                  </div>

                  <span
                    style={{
                      display: "block",
                      fontSize: "10px",
                      color: "var(--text-muted)",
                      marginTop: "6px",
                      letterSpacing: "0.06em",
                    }}
                  >
                    SKU {String(item.variant || item.product).slice(-8).toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              borderTop: "1px solid var(--border-muted)",
              marginTop: "18px",
              paddingTop: "16px",
            }}
          >
            <span style={{ ...label, marginBottom: 0 }}>Your earnings on this order</span>
            <span
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 900,
                fontSize: "22px",
                color: "var(--accent-color)",
              }}
            >
              {fmt(order.sellerSubtotal?.amount, currency)}
            </span>
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "8px 0 0", lineHeight: 1.6 }}>
            Item value of your products only — shipping and tax the buyer paid are
            settled by the platform.
          </p>
        </div>

        {/* ── Ship to + payment ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={label}>Ship to</span>
              <button
                onClick={copyAddress}
                style={{
                  background: "transparent",
                  border: "1px solid var(--accent-color)",
                  color: "var(--accent-color)",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: "9px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "4px 9px",
                  cursor: "pointer",
                  marginBottom: "8px",
                }}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div style={{ fontSize: "14px", lineHeight: 1.8 }}>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  fontSize: "15px",
                  color: "var(--white-or-black)",
                }}
              >
                {address.fullname}
              </div>
              <div>{address.line1}</div>
              {address.line2 && <div>{address.line2}</div>}
              <div>
                {address.city}, {address.state} {address.pincode}
              </div>
              <div>{address.country}</div>
              <div style={{ marginTop: "10px", color: "var(--text-muted)" }}>
                Phone: {address.phone}
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <span style={label}>Buyer</span>
            <div style={{ fontSize: "14px", lineHeight: 1.8 }}>
              <div style={{ color: "var(--white-or-black)", fontWeight: 600 }}>
                {order.buyer?.fullname || "—"}
              </div>
              <div style={{ color: "var(--text-muted)" }}>{order.buyer?.email}</div>
              {order.buyer?.contact && (
                <div style={{ color: "var(--text-muted)" }}>{order.buyer.contact}</div>
              )}
            </div>
          </div>

          <div style={cardStyle}>
            <span style={label}>Payment</span>
            <div style={{ fontSize: "14px", lineHeight: 1.9 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Status</span>
                <span
                  style={{
                    color:
                      PAYMENT_COLOR[order.payment?.status] || "var(--text-color)",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    fontSize: "12px",
                    letterSpacing: "0.1em",
                  }}
                >
                  {order.payment?.status}
                </span>
              </div>
              {order.payment?.method && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Method</span>
                  <span style={{ textTransform: "uppercase" }}>{order.payment.method}</span>
                </div>
              )}
              {order.payment?.paidAt && (
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Paid on</span>
                  <span>
                    {new Date(order.payment.paidAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
  );
}
