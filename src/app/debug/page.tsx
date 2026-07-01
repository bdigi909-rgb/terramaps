"use client";
import { useEffect, useState } from "react";
export default function Debug() {
  const [info, setInfo] = useState<any>({});
  useEffect(() => {
    setInfo({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      touch: "ontouchstart" in window,
      maxTouch: navigator.maxTouchPoints,
    });
  }, []);
  return (
    <div style={{ padding: 20, background: "#0D1117", color: "#fff", minHeight: "100vh", fontFamily: "monospace" }}>
      <h1 style={{ color: "#F97316" }}>Debug Info</h1>
      {Object.entries(info).map(([k, v]) => (
        <div key={k} style={{ marginBottom: 10, fontSize: 18 }}>
          <span style={{ color: "#64748B" }}>{k}: </span>
          <span style={{ color: "#22C55E" }}>{String(v)}</span>
        </div>
      ))}
    </div>
  );
}
