/**
 * The small outlined status tag used across the seller order screens.
 */
export default function Pill({ text, color }) {
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
