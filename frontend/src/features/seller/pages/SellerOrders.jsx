import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import SellerNav from "../../../components/SellerNav";
import { useSellerOrders } from "../hooks/useSellerOrders";
import { fmt } from "../../checkout/pricing";
import { STATUS_COLOR, PAYMENT_COLOR, FONT_HREF } from "../orderUi";
import Pill from "../components/Pill";

// "To ship" is the queue a seller actually works from — everything paid for and
// not yet handed over.
const FILTERS = [
  { key: "toShip", label: "To Ship" },
  { key: "all", label: "All" },
];

const isToShip = (order) =>
  order.status === "confirmed" || order.status === "pending";

export default function SellerOrders() {
  const { isMobile } = useBreakpoint();
  const { orders, loading, error } = useSelector((s) => s.sellerOrder);
  const { fetchSellerOrders } = useSellerOrders();
  const [filter, setFilter] = useState("toShip");

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    fetchSellerOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = useMemo(
    () => (filter === "toShip" ? orders.filter(isToShip) : orders),
    [orders, filter],
  );

  const pendingCount = useMemo(() => orders.filter(isToShip).length, [orders]);
  const unitsToShip = useMemo(
    () => orders.filter(isToShip).reduce((sum, o) => sum + (o.itemCount || 0), 0),
    [orders],
  );

  return (
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
          padding: isMobile ? "28px 16px 64px" : "48px 32px 80px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <span
            style={{
              display: "block",
              fontFamily: "'Inter', sans-serif",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--accent-color)",
              marginBottom: "6px",
            }}
          >
            SELLER STUDIO
          </span>
          <h1
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: isMobile ? "28px" : "clamp(30px, 4vw, 42px)",
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              color: "var(--white-or-black)",
              margin: 0,
            }}
          >
            Orders To Fulfil
          </h1>
        </div>

        {/* Summary strip */}
        <div
          style={{
            display: "flex",
            gap: isMobile ? "20px" : "40px",
            padding: "18px 20px",
            background: "var(--card-bg)",
            borderLeft: "3px solid var(--accent-color)",
            marginBottom: "28px",
          }}
        >
          {[
            { value: pendingCount, label: "Orders to ship" },
            { value: unitsToShip, label: "Units to pack" },
            { value: orders.length, label: "Orders total" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  fontSize: "22px",
                  color: "var(--accent-color)",
                  lineHeight: 1,
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginTop: "5px",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                background:
                  filter === key ? "var(--accent-color)" : "transparent",
                color:
                  filter === key
                    ? "var(--black-or-white)"
                    : "var(--text-muted)",
                border:
                  filter === key
                    ? "1px solid var(--accent-color)"
                    : "1px solid var(--border-muted)",
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 800,
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "9px 18px",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div
            style={{
              padding: "14px 16px",
              background: "rgba(147,0,10,0.25)",
              border: "1px solid rgba(255,180,171,0.3)",
              color: "#ffb4ab",
              fontSize: "13px",
              marginBottom: "24px",
            }}
          >
            {error}
          </div>
        )}

        {loading && (
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Loading orders…
          </p>
        )}

        {!loading && visible.length === 0 && (
          <div
            style={{
              padding: "72px 24px",
              textAlign: "center",
              border: "2px dashed rgba(var(--accent-rgb),0.18)",
              background: "var(--card-bg)",
            }}
          >
            <h2
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 900,
                fontSize: "18px",
                textTransform: "uppercase",
                color: "var(--white-or-black)",
                margin: "0 0 8px 0",
              }}
            >
              {filter === "toShip" ? "Nothing to ship" : "No orders yet"}
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
              {filter === "toShip"
                ? "Every paid order has been dispatched."
                : "Orders for your drops will land here the moment they're paid for."}
            </p>
          </div>
        )}

        {/* Order list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {visible.map((order) => (
            <Link
              key={order._id}
              to={`/seller/orders/${order._id}`}
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
                  (e.currentTarget.style.borderColor = "var(--accent-color)")
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
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
                      color={
                        PAYMENT_COLOR[order.payment?.status] ||
                        "var(--text-muted)"
                      }
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
                    {fmt(
                      order.sellerSubtotal?.amount,
                      order.sellerSubtotal?.currency,
                    )}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
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
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
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
                    {order.itemCount} unit{order.itemCount === 1 ? "" : "s"} ·{" "}
                    {order.buyer?.fullname || "Buyer"} ·{" "}
                    {order.shippingAddress?.city} ·{" "}
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
  );
}
