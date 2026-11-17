import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    toggleTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", userSelect: "none" }}>
      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: theme === "dark" ? "var(--accent-color)" : "var(--text-muted)", transition: "color 0.3s" }}>
        DARK
      </span>
      <div
        onClick={handleToggle}
        style={{
          position: "relative",
          width: "42px",
          height: "22px",
          border: "2px solid var(--text-color)",
          background: "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          padding: "2px",
          transition: "border-color 0.3s ease",
        }}
      >
        <div
          style={{
            width: "14px",
            height: "14px",
            background: "var(--accent-color)",
            transform: theme === "light" ? "translateX(20px)" : "translateX(0)",
            transition: "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), background 0.3s ease",
          }}
        />
      </div>
      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: theme === "light" ? "var(--accent-color)" : "var(--text-muted)", transition: "color 0.3s" }}>
        LIGHT
      </span>
    </div>
  );
}
