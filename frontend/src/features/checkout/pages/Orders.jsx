import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import StoreNav from "../../../components/StoreNav";
import { useCheckout } from "../hooks/useCheckout";
import { fmt } from "../pricing";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap";

const STATUS_COLOR = {
  pending: "var(--text-muted)",
  confirmed: "#4ade80",
  shipped: "#60a5fa",
  delivered: "#4ade80",
  cancelled: "#ff6b6b",
};

const PAYMENT_COLOR = {
  created: "var(--text-muted)",
  paid: "#4ade80",
  failed: "#ff6b6b",
  refunded: "#facc15",
};

function Pill({ text, color }) {
  return (
    <span
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color,
        border: `1px solid ${color}`,
        padding: "3px 9px",
      }}
    >
      {text}
    </span>
  );
}

export default function Orders() {
  const { isMobile } = useBreakpoint();
  const { orders, loading } = useSelector((s) => s.order);
  const { fetchOrders } = useCheckout();

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={FONT_HREF} rel="stylesheet" />

      <div style={{ minHeight: "100vh", background: "var(--bg-color)", color: "var(--text-color)" }}>
        <StoreNav />

        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            padding: isMobile ? "32px 20px 80px" : "48px 48px 80px",
          }}
        >
          <h1
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: isMobile ? "28px" : "clamp(32px, 4vw, 44px)",
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              color: "var(--white-or-black)",
              margin: "0 0 20px 0",
              paddingBottom: "20px",
              borderBottom: "1px solid var(--surface-border)",
            }}
          >
            My Orders
          </h1>

          {loading && (
            <p style={{ fontFamily: "'Inter', sans-serif", color: "var(--text-muted)" }}>
              Loading orders…
            </p>
          )}

          {!loading && orders.length === 0 && (
            <div style={{ padding: "72px 0", textAlign: "center" }}>
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 900,
                  fontSize: "22px",
                  textTransform: "uppercase",
                  color: "var(--white-or-black)",
                  margin: "0 0 8px 0",
                }}
              >
                No Orders Yet
              </h2>
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: "italic",
                  fontSize: "15px",
                  color: "var(--text-muted)",
                  margin: "0 0 24px 0",
                }}
              >
                Everything you buy will show up here.
              </p>
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
                  Shop Now
                </button>
              </Link>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/order/${order._id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: "var(--surface-color)",
                    border: "1px solid var(--border-muted)",
                    padding: isMobile ? "18px" : "22px 24px",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "var(--gold-tint-deep)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border-muted)")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
                      marginBottom: "14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 900,
                          fontSize: "12px",
                          letterSpacing: "0.1em",
                          color: "var(--text-color)",
                        }}
                      >
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <Pill
                        text={order.status}
                        color={STATUS_COLOR[order.status] || "var(--text-muted)"}
                      />
                      <Pill
                        text={order.payment?.status}
                        color={PAYMENT_COLOR[order.payment?.status] || "var(--text-muted)"}
                      />
                    </div>

                    <span
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 900,
                        fontSize: "18px",
                        color: "var(--accent-color)",
                      }}
                    >
                      {fmt(order.total?.amount, order.total?.currency)}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    {order.items?.slice(0, 4).map((item, i) => (
                      <div
                        key={`${item.product}-${i}`}
                        style={{
                          width: "38px",
                          height: "48px",
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
                    ))}
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "12px",
                        color: "var(--text-muted)",
                        marginLeft: "4px",
                      }}
                    >
                      {order.items?.length} item{order.items?.length === 1 ? "" : "s"} ·{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
