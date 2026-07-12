"use client";
import { useState, useEffect } from "react";

const VAPID_PUBLIC_KEY = "BOqYeiKA0GQFeY9YSpxhJJbhZ_G93WiLmWN2oB5R_zQJ22MDmedRVKB64eM9kpnJZRKaqaJQl5tIw3whIOF-N9c";

export default function PushNotification() {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setSupported(true);
      navigator.serviceWorker.register("/sw.js").then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setSubscribed(!!sub);
        });
      });
    }
  }, []);

  async function subscribe() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY
      });
      await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub })
      });
      setSubscribed(true);
    } catch (err) {
      console.error("Subscribe error:", err);
    }
    setLoading(false);
  }

  async function unsubscribe() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
    setSubscribed(false);
  }

  if (!supported) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button onClick={subscribed ? unsubscribe : subscribe} disabled={loading}
        style={{ background: subscribed ? "#22C55E" : "#F97316", border: "none", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
        {loading ? "..." : subscribed ? "🔔 Notifs activées" : "🔕 Activer notifs"}
      </button>
    </div>
  );
}
