import { createContext, useContext, useEffect, useState } from "react";
import { gsap } from "gsap";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const isLight = theme === "light";
    
    // Set theme class on root element for compatibility
    if (isLight) {
      document.documentElement.classList.add("theme-light");
      document.documentElement.classList.remove("theme-dark");
    } else {
      document.documentElement.classList.add("theme-dark");
      document.documentElement.classList.remove("theme-light");
    }

    // Set accent rgb on documentElement style directly
    document.documentElement.style.setProperty('--accent-rgb', isLight ? '197, 160, 89' : '245, 197, 24');

    // Animate the custom properties on documentElement (html) for smooth transitions
    gsap.to("html", {
      "--bg-color": isLight ? "#FAF6ED" : "#0a0a0a",
      "--text-color": isLight ? "#121212" : "#e5e2e1",
      "--text-muted": isLight ? "rgba(18, 18, 18, 0.6)" : "rgba(229, 226, 225, 0.5)",
      "--accent-color": isLight ? "#C5A059" : "#F5C518",
      "--accent-hover": isLight ? "#A8823F" : "#ffd700",
      "--surface-color": isLight ? "#EBE6D8" : "#111111",
      "--surface-border": isLight ? "rgba(197, 160, 89, 0.25)" : "rgba(245, 197, 24, 0.1)",
      "--nav-bg": isLight ? "rgba(250, 246, 237, 0.85)" : "rgba(10, 10, 10, 0.85)",
      "--card-bg": isLight ? "#F4EFE6" : "#141414",
      "--border-muted": isLight ? "rgba(12, 12, 12, 0.08)" : "rgba(255, 255, 255, 0.06)",
      "--white-or-black": isLight ? "#0a0a0a" : "#ffffff",
      "--black-or-white": isLight ? "#FAF6ED" : "#0a0a0a",
      "--gold-tint": isLight ? "rgba(197, 160, 89, 0.12)" : "rgba(245, 197, 24, 0.1)",
      "--gold-tint-deep": isLight ? "rgba(197, 160, 89, 0.25)" : "rgba(245, 197, 24, 0.25)",
      "--gold-text": isLight ? "#9C7A3C" : "#F5C518",
      "--nav-link-color": isLight ? "rgba(18, 18, 18, 0.65)" : "rgba(229, 226, 225, 0.5)",
      "--shadow-color": isLight ? "rgba(197, 160, 89, 0.1)" : "rgba(0, 0, 0, 0.5)",
      duration: 0.6,
      ease: "power2.out"
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
