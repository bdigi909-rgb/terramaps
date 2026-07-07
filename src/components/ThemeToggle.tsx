"use client";
import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("tm_theme");
    if (saved === "light") {
      setIsDark(false);
      document.body.classList.add("light-mode");
    }
  }, []);

  function toggle() {
    if (isDark) {
      document.body.classList.add("light-mode");
      localStorage.setItem("tm_theme", "light");
    } else {
      document.body.classList.remove("light-mode");
      localStorage.setItem("tm_theme", "dark");
    }
    setIsDark(!isDark);
  }

  return (
    <button onClick={toggle}
      title={isDark ? "Mode clair" : "Mode sombre"}
      style={{ background: "transparent", border: "1px solid #1E2D3D", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#8BACC8", fontSize: 16, display: "flex", alignItems: "center" }}>
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
