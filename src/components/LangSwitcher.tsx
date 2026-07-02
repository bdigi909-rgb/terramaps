"use client";
import { useState, useEffect } from "react";

export type Lang = "fr" | "ar" | "en";

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("fr");
  useEffect(() => {
    const saved = localStorage.getItem("tm_lang") as Lang;
    if (saved) setLangState(saved);
  }, []);
  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("tm_lang", l);
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = l;
  }
  return [lang, setLang];
}

export default function LangSwitcher() {
  const [lang, setLang] = useLang();
  const langs = [
    { code: "fr", label: "FR", flag: "🇫🇷" },
  
  ];
  return (
    <div style={{ display: "flex", gap: 4, background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: 3 }}>
      {langs.map(l => (
        <button key={l.code} onClick={() => setLang(l.code as Lang)}
          style={{ background: lang === l.code ? "#F97316" : "transparent", border: "none", color: lang === l.code ? "#fff" : "#64748B", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700, transition: "all 0.15s" }}>
          {l.flag} {l.label}
        </button>
      ))}
    </div>
  );
}
