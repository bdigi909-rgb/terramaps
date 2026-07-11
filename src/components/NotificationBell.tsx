"use client";
import { useState, useEffect, useRef } from "react";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(loadNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function loadNotifs() {
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setNotifs(data);
    }
  }

  async function markRead(id: number) {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  async function markAllRead() {
    const unread = notifs.filter(n => !n.read);
    for (const n of unread) await markRead(n.id);
  }

  const unreadCount = notifs.filter(n => !n.read).length;

  const typeColor: Record<string, string> = {
    info: "#3B82F6", success: "#22C55E", warning: "#F59E0B", error: "#EF4444"
  };

  const typeIcon: Record<string, string> = {
    info: "ℹ️", success: "✅", warning: "⚠️", error: "❌"
  };

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `${mins} min`;
    if (hours < 24) return `${hours}h`;
    return new Date(date).toLocaleDateString("fr-FR");
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ position: "relative", background: "transparent", border: "1px solid #1E2D3D", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#8BACC8", display: "flex", alignItems: "center" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span style={{ position: "absolute", top: -4, right: -4, background: "#EF4444", color: "#fff", fontSize: 9, fontWeight: 700, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 360, background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 1000 }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #1E2D3D", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#E2EAF2" }}>Notifications {unreadCount > 0 && <span style={{ color: "#EF4444" }}>({unreadCount})</span>}</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background: "transparent", border: "none", color: "#F97316", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                Tout marquer lu
              </button>
            )}
          </div>

          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {notifs.length === 0 ? (
              <div style={{ padding: "30px 20px", textAlign: "center", color: "#4B6080" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                <div style={{ fontSize: 13 }}>Aucune notification</div>
              </div>
            ) : notifs.map(n => (
              <div key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                style={{ padding: "12px 16px", borderBottom: "1px solid #0D1117", background: n.read ? "transparent" : "rgba(249,115,22,0.05)", cursor: n.read ? "default" : "pointer", display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                <div style={{ fontSize: 18, flexShrink: 0 }}>{typeIcon[n.type] || "ℹ️"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: n.read ? "#8BACC8" : "#E2EAF2", marginBottom: 2 }}>{n.title}</div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>{n.message}</div>
                  <div style={{ fontSize: 10, color: "#4B6080", marginTop: 4 }}>{timeAgo(n.createdAt)}</div>
                </div>
                {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F97316", flexShrink: 0, marginTop: 4 }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
