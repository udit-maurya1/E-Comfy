import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import SellerNav from "../../../components/SellerNav";
import { useSellerOrders } from "../hooks/useSellerOrders";
import RevenueChart from "../components/RevenueChart";
import { fmt } from "../../checkout/pricing";
import { STATUS_COLOR, FONT_HREF } from "../orderUi";

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

const cardStyle = {
  background: "var(--card-bg)",
  border: "1px solid var(--border-muted)",
  padding: "24px",
};

const label = {
  display: "block",
  fontFamily: "'Inter', sans-serif",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
};

/** Percentage change against the previous window, or null when there's no base. */
const trendOf = (current, previous) => {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
};

function StatTile({ title, value, foot, trend }) {
  return (
    <div style={{ ...cardStyle, padding: "20px" }}>
      <span style={label}>{title}</span>
      <div
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 900,
          fontSize: "clamp(22px, 3vw, 28px)",
          letterSpacing: "-0.02em",
          color: "var(--white-or-black)",
          margin: "10px 0 6px",
        }}
      >
        {value}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        {trend !== null && trend !== undefined && (
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              color: trend >= 0 ? "#4ade80" : "#ff6b6b",
            }}
          >
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        )}
        {foot && (
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{foot}</span>
        )}
      </div>
    </div>
  );
}

export default function SellerDashboard() {
  const { isMobile } = useBreakpoint();
  const { stats, statsLoading, error } = useSelector((s) => s.sellerOrder);
  const { fetchSellerStats } = useSellerOrders();
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    fetchSellerStats(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const currency = stats?.currency || "INR";
  const revenueTrend = stats
    ? trendOf(stats.window.revenue, stats.previousWindowRevenue)
    : null;

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
          maxWidth: "1100px",
          margin: "0 auto",
          padding: isMobile ? "28px 16px 64px" : "48px 32px 80px",
        }}
      >
        {/* Header + range filter, one row above the charts */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <div>
            <span style={{ ...label, color: "var(--accent-color)", letterSpacing: "0.2em", marginBottom: "6px" }}>
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
              Sales Dashboard
            </h1>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {RANGES.map((range) => (
              <button
                key={range.days}
                onClick={() => setDays(range.days)}
                style={{
                  background: days === range.days ? "var(--accent-color)" : "transparent",
                  color: days === range.days ? "var(--black-or-white)" : "var(--text-muted)",
                  border:
                    days === range.days
                      ? "1px solid var(--accent-color)"
                      : "1px solid var(--border-muted)",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  fontSize: "10px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: "9px 16px",
                  cursor: "pointer",
                }}
              >
                {range.label}
              </button>
            ))}
          </div>
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

        {!stats ? (
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            {statsLoading ? "Crunching your sales…" : "No sales data yet."}
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              opacity: statsLoading ? 0.6 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {/* Headline figures for the selected window */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(2, 1fr)"
                  : "repeat(4, 1fr)",
                gap: "16px",
              }}
            >
              <StatTile
                title={`Revenue · ${days}d`}
                value={fmt(stats.window.revenue, currency)}
                trend={revenueTrend}
                foot={
                  revenueTrend === null
                    ? "no earlier sales to compare"
                    : "vs previous period"
                }
              />
              <StatTile
                title={`Orders · ${days}d`}
                value={stats.window.orders}
                foot={`${stats.window.units} units sold`}
              />
              <StatTile
                title="Avg order value"
                value={fmt(stats.window.averageOrderValue, currency)}
                foot="your lines only"
              />
              <StatTile
                title="Lifetime revenue"
                value={fmt(stats.lifetime.revenue, currency)}
                foot={`${stats.lifetime.orders} orders all time`}
              />
            </div>

            {/* Daily revenue */}
            <div style={cardStyle}>
              <div style={{ marginBottom: "6px" }}>
                <h2
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 800,
                    fontSize: "18px",
                    letterSpacing: "-0.01em",
                    color: "var(--white-or-black)",
                    margin: "0 0 4px",
                  }}
                >
                  Revenue per day
                </h2>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                  Paid orders only, counted on the day they were placed.
                </p>
              </div>

              <RevenueChart
                series={stats.series}
                currency={currency}
                isMobile={isMobile}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr",
                gap: "20px",
                alignItems: "start",
              }}
            >
              {/* Best sellers */}
              <div style={cardStyle}>
                <span style={{ ...label, marginBottom: "16px" }}>
                  Best sellers · all time
                </span>

                {stats.topProducts.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                    Nothing sold yet.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {stats.topProducts.map((product) => {
                      const share = stats.topProducts[0].revenue
                        ? (product.revenue / stats.topProducts[0].revenue) * 100
                        : 0;
                      return (
                        <Link
                          key={product.product}
                          to={`/seller/product/${product.product}`}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <div
                              style={{
                                width: "40px",
                                height: "50px",
                                background: "var(--surface-color)",
                                border: "1px solid var(--surface-border)",
                                overflow: "hidden",
                                flexShrink: 0,
                              }}
                            >
                              {product.image && (
                                <img
                                  src={product.image}
                                  alt={product.title}
                                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                />
                              )}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  gap: "10px",
                                  marginBottom: "6px",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "var(--text-color)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {product.title}
                                </span>
                                <span
                                  style={{
                                    fontFamily: "'Montserrat', sans-serif",
                                    fontWeight: 800,
                                    fontSize: "13px",
                                    color: "var(--text-color)",
                                    flexShrink: 0,
                                  }}
                                >
                                  {fmt(product.revenue, currency)}
                                </span>
                              </div>

                              {/* Share of the best seller's revenue */}
                              <div style={{ height: "6px", background: "var(--surface-color)" }}>
                                <div
                                  style={{
                                    width: `${share}%`,
                                    height: "100%",
                                    background: "var(--gold-text)",
                                    borderRadius: "0 3px 3px 0",
                                  }}
                                />
                              </div>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "11px",
                                  color: "var(--text-muted)",
                                  marginTop: "5px",
                                }}
                              >
                                {product.units} units · {product.orders} orders
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Fulfilment state */}
                <div style={cardStyle}>
                  <span style={{ ...label, marginBottom: "14px" }}>Order status</span>

                  {Object.keys(stats.statusBreakdown).length === 0 ? (
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                      No paid orders yet.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {Object.entries(stats.statusBreakdown).map(([status, count]) => (
                        <div
                          key={status}
                          style={{ display: "flex", alignItems: "center", gap: "10px" }}
                        >
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              background: STATUS_COLOR[status] || "var(--text-muted)",
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              flex: 1,
                              fontSize: "12px",
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              color: "var(--text-color)",
                            }}
                          >
                            {status}
                          </span>
                          <span
                            style={{
                              fontFamily: "'Montserrat', sans-serif",
                              fontWeight: 800,
                              fontSize: "14px",
                              color: "var(--text-color)",
                            }}
                          >
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Link
                    to="/seller/orders"
                    style={{
                      display: "inline-block",
                      marginTop: "16px",
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: "10px",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--accent-color)",
                      textDecoration: "none",
                      borderBottom: "1px solid rgba(var(--accent-rgb),0.4)",
                    }}
                  >
                    Go to orders →
                  </Link>
                </div>

                {/* Restock warnings */}
                <div style={cardStyle}>
                  <span style={{ ...label, marginBottom: "6px" }}>
                    Running low ·{" "}
                    {stats.catalogue.lowStockThreshold ?? 5} or fewer
                  </span>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "0 0 14px" }}>
                    {stats.catalogue.products} products ·{" "}
                    {stats.catalogue.variants} variants ·{" "}
                    {stats.catalogue.outOfStock} out of stock
                  </p>

                  {stats.lowStock.length === 0 ? (
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                      Every variant is comfortably stocked.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {stats.lowStock.map((item) => (
                        <Link
                          key={`${item.product}-${item.variant}`}
                          to={`/seller/product/${item.product}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            textDecoration: "none",
                            color: "inherit",
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "var(--text-color)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.title}
                            </div>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                              {Object.entries(item.attributes || {})
                                .map(([key, val]) => `${key}: ${val}`)
                                .join(" · ") || "Standard variant"}
                            </span>
                          </div>
                          <span
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "10px",
                              fontWeight: 700,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              color: item.stock > 0 ? "#facc15" : "#ff6b6b",
                              border: `1px solid ${item.stock > 0 ? "#facc15" : "#ff6b6b"}`,
                              padding: "3px 8px",
                              flexShrink: 0,
                            }}
                          >
                            {item.stock > 0 ? `${item.stock} left` : "Out"}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
