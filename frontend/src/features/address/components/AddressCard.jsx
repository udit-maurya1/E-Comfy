/**
 * One saved address, rendered as a selectable radio card. `selected` drives the
 * gold border, so the buyer can see at a glance where the order is going.
 */
export default function AddressCard({
  address,
  selected,
  onSelect,
  onEdit,
  onDelete,
  isMobile,
}) {
  const actionStyle = {
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    transition: "color 0.18s",
  };

  return (
    <div
      onClick={() => onSelect(address._id)}
      style={{
        display: "flex",
        gap: "14px",
        padding: isMobile ? "18px" : "20px 22px",
        background: selected ? "var(--gold-tint)" : "var(--surface-color)",
        border: `1px solid ${selected ? "var(--accent-color)" : "var(--border-muted)"}`,
        cursor: "pointer",
        transition: "border-color 0.2s, background 0.2s",
      }}
    >
      {/* Radio */}
      <div
        style={{
          flexShrink: 0,
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          border: `2px solid ${selected ? "var(--accent-color)" : "var(--border-muted)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "2px",
        }}
      >
        {selected && (
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--accent-color)",
            }}
          />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "-0.01em",
              color: "var(--text-color)",
            }}
          >
            {address.fullname}
          </span>

          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent-color)",
              border: "1px solid var(--gold-tint-deep)",
              padding: "3px 8px",
            }}
          >
            {address.label}
          </span>

          {address.isDefault && (
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#4ade80",
              }}
            >
              Default
            </span>
          )}
        </div>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
            lineHeight: 1.6,
            color: "var(--text-muted)",
            margin: 0,
          }}
        >
          {[address.line1, address.line2].filter(Boolean).join(", ")}
          <br />
          {address.city}, {address.state} {address.pincode}
          <br />
          {address.country}
        </p>

        <p
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--text-color)",
            margin: "10px 0 0 0",
          }}
        >
          {address.phone}
        </p>

        {(onEdit || onDelete) && (
          <div style={{ display: "flex", gap: "18px", marginTop: "14px" }}>
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(address);
                }}
                style={{ ...actionStyle, color: "var(--accent-color)" }}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(address._id);
                }}
                style={{ ...actionStyle, color: "rgba(229,226,225,0.35)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ff6b6b")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(229,226,225,0.35)")
                }
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
