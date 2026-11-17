import { useState } from "react";
import { fmt } from "../../checkout/pricing";

/**
 * Daily takings over the selected window, as bars.
 *
 * Marks are drawn in --gold-text rather than --accent-color: the brand gold
 * only reaches 2.15:1 against the light theme's cream surface, which is below
 * the 3:1 a filled mark needs to be legible. --gold-text is the same gold in
 * dark mode and its darker step in light mode, and clears 3:1 in both.
 */

// Drawn in viewBox units and scaled by CSS, so the chart is responsive without
// measuring the DOM. Tooltips are positioned in percentages of the same box.
const VB_W = 800;
const VB_H = 260;
const PAD = { top: 18, right: 8, bottom: 26, left: 52 };
const PLOT_W = VB_W - PAD.left - PAD.right;
const PLOT_H = VB_H - PAD.top - PAD.bottom;

const shortDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

/** 1 200 → "1.2k"; keeps the y-axis to three characters. */
const compact = (n) => {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(Math.round(n));
};

/**
 * A round number at or above the tallest bar, so the top gridline is a value a
 * reader can hold in their head rather than the exact maximum.
 */
const niceCeiling = (max) => {
  if (max <= 0) return 100;
  const magnitude = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / (magnitude / 2)) * (magnitude / 2);
};

export default function RevenueChart({ series, currency, isMobile }) {
  const [hovered, setHovered] = useState(null);
  const [asTable, setAsTable] = useState(false);

  const peak = Math.max(...series.map((d) => d.revenue), 0);
  const ceiling = niceCeiling(peak);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * ceiling);

  const slot = PLOT_W / Math.max(series.length, 1);
  // A 2px surface gap between neighbouring bars, in viewBox units.
  const gap = Math.min(slot * 0.3, 6);
  const barW = Math.max(slot - gap, 1);
  const radius = Math.min(4, barW / 2);

  const xOf = (i) => PAD.left + i * slot + gap / 2;
  const yOf = (value) => PAD.top + PLOT_H - (value / ceiling) * PLOT_H;

  // Label roughly six dates whatever the range, so ticks never collide.
  const labelEvery = Math.max(1, Math.round(series.length / (isMobile ? 4 : 6)));
  const peakIndex = series.findIndex((d) => d.revenue === peak && peak > 0);

  if (asTable) {
    return (
      <>
        <TableToggle asTable={asTable} onToggle={() => setAsTable(false)} />
        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr>
                {["Date", "Revenue", "Orders", "Units"].map((head, i) => (
                  <th
                    key={head}
                    style={{
                      textAlign: i === 0 ? "left" : "right",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      padding: "8px 6px",
                      borderBottom: "1px solid var(--border-muted)",
                      position: "sticky",
                      top: 0,
                      background: "var(--card-bg)",
                    }}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {series.map((day) => (
                <tr key={day.date}>
                  <td style={{ padding: "7px 6px", borderBottom: "1px solid var(--border-muted)" }}>
                    {shortDate(day.date)}
                  </td>
                  <td style={{ padding: "7px 6px", textAlign: "right", borderBottom: "1px solid var(--border-muted)" }}>
                    {fmt(day.revenue, currency)}
                  </td>
                  <td style={{ padding: "7px 6px", textAlign: "right", color: "var(--text-muted)", borderBottom: "1px solid var(--border-muted)" }}>
                    {day.orders}
                  </td>
                  <td style={{ padding: "7px 6px", textAlign: "right", color: "var(--text-muted)", borderBottom: "1px solid var(--border-muted)" }}>
                    {day.units}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  return (
    <>
      <TableToggle asTable={asTable} onToggle={() => setAsTable(true)} />

      <div style={{ position: "relative" }}>
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          width="100%"
          height="auto"
          role="img"
          aria-label={`Daily revenue for the last ${series.length} days`}
          style={{ display: "block", overflow: "visible" }}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Gridlines and y scale — recessive, behind the marks */}
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={VB_W - PAD.right}
                y1={yOf(tick)}
                y2={yOf(tick)}
                stroke="var(--border-muted)"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 10}
                y={yOf(tick) + 4}
                textAnchor="end"
                fill="var(--text-muted)"
                fontSize="11"
                fontFamily="'Inter', sans-serif"
              >
                {compact(tick)}
              </text>
            </g>
          ))}

          {series.map((day, i) => {
            const height = day.revenue > 0 ? PLOT_H - (yOf(day.revenue) - PAD.top) : 0;
            const isHovered = hovered === i;

            return (
              <g key={day.date}>
                {/* Full-height hit target — a 3px-tall bar is impossible to hover */}
                <rect
                  x={xOf(i) - gap / 2}
                  y={PAD.top}
                  width={slot}
                  height={PLOT_H}
                  fill="transparent"
                  onMouseEnter={() => setHovered(i)}
                  style={{ cursor: "pointer" }}
                />
                {height > 0 && (
                  <rect
                    x={xOf(i)}
                    y={yOf(day.revenue)}
                    width={barW}
                    height={height}
                    rx={radius}
                    ry={radius}
                    fill="var(--gold-text)"
                    opacity={hovered === null || isHovered ? 1 : 0.45}
                    style={{ transition: "opacity 0.15s", pointerEvents: "none" }}
                  />
                )}
                {i % labelEvery === 0 && (
                  <text
                    x={xOf(i) + barW / 2}
                    y={VB_H - 8}
                    textAnchor="middle"
                    fill="var(--text-muted)"
                    fontSize="11"
                    fontFamily="'Inter', sans-serif"
                  >
                    {shortDate(day.date)}
                  </text>
                )}
              </g>
            );
          })}

          {/* One direct label, on the best day — a number on every bar is noise */}
          {peakIndex >= 0 && hovered === null && (
            <text
              x={Math.min(
                Math.max(xOf(peakIndex) + barW / 2, PAD.left + 24),
                VB_W - PAD.right - 24,
              )}
              y={yOf(peak) - 7}
              textAnchor="middle"
              fill="var(--text-color)"
              fontSize="12"
              fontWeight="700"
              fontFamily="'Montserrat', sans-serif"
            >
              {fmt(peak, currency)}
            </text>
          )}

          {/* Baseline */}
          <line
            x1={PAD.left}
            x2={VB_W - PAD.right}
            y1={PAD.top + PLOT_H}
            y2={PAD.top + PLOT_H}
            stroke="var(--surface-border)"
            strokeWidth="1"
          />
        </svg>

        {/* Tooltip, positioned as a percentage of the same viewBox */}
        {hovered !== null && (
          <div
            style={{
              position: "absolute",
              left: `${((xOf(hovered) + barW / 2) / VB_W) * 100}%`,
              top: `${(yOf(series[hovered].revenue) / VB_H) * 100}%`,
              transform: "translate(-50%, -115%)",
              background: "var(--surface-color)",
              border: "1px solid var(--surface-border)",
              padding: "8px 10px",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              zIndex: 2,
            }}
          >
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: "4px",
              }}
            >
              {shortDate(series[hovered].date)}
            </div>
            <div
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "15px",
                fontWeight: 800,
                color: "var(--text-color)",
              }}
            >
              {fmt(series[hovered].revenue, currency)}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
              {series[hovered].orders} order
              {series[hovered].orders === 1 ? "" : "s"} ·{" "}
              {series[hovered].units} unit
              {series[hovered].units === 1 ? "" : "s"}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function TableToggle({ asTable, onToggle }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
      <button
        onClick={onToggle}
        style={{
          background: "transparent",
          border: "1px solid var(--border-muted)",
          color: "var(--text-muted)",
          fontFamily: "'Inter', sans-serif",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          padding: "5px 10px",
          cursor: "pointer",
        }}
      >
        {asTable ? "View chart" : "View table"}
      </button>
    </div>
  );
}
