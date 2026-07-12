"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  time: string;
}

const suggestions: Record<string, string[]> = {
  default: [
    "Comment calculer le volume de deblai ?",
    "Quelle est la difference entre EPSG:26191 et WGS84 ?",
    "Comment importer des points GSI Leica ?",
    "Comment lire un fichier CSV topographique ?",
  ],
  survey: [
    "Comment numéroter automatiquement les points ?",
    "Comment convertir Lambert vers WGS84 ?",
    "Comment calculer la superficie d un polygone ?",
    "Quelle precision pour un leve topographique ?",
  ],
  nivellement: [
    "Comment verifier la fermeture du nivellement ?",
    "Quelle tolerance de fermeture utiliser ?",
    "Comment compenser un circuit de nivellement ?",
    "Difference entre nivellement direct et indirect ?",
  ],
  polygonale: [
    "Comment calculer la fermeture angulaire ?",
    "Comment appliquer la compensation de Bowditch ?",
    "Quelle precision pour une polygonale ?",
    "Comment calculer les coordonnees des sommets ?",
  ],
  volumes: [
    "Comment calculer les volumes par la methode des prismes ?",
    "Quelle est la difference entre deblai et remblai ?",
    "Comment optimiser le bilan des terres ?",
    "Comment calculer le foisonnement ?",
  ],
  devis: [
    "Quel prix pour un leve topographique < 1 Ha au Maroc ?",
    "Comment calculer le cout d un bornage ?",
    "Quels documents pour un leve officiel ?",
    "Delai moyen pour un leve topographique ?",
  ],
  finance: [
    "Comment calculer la TVA sur les prestations topo ?",
    "Quelles charges pour un bureau d etudes au Maroc ?",
    "Comment etablir un devis professionnel ?",
    "Quels sont les tarifs du marche au Maroc ?",
  ],
};
export default function AIAssist({ context }: { context?: string }) {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";


  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const pageKey = pathname.includes("nivellement") ? "nivellement" :
    pathname.includes("polygonale") ? "polygonale" :
    pathname.includes("volumes") ? "volumes" :
    pathname.includes("survey") ? "survey" :
    pathname.includes("devis") ? "devis" :
    pathname.includes("finance") ? "finance" : "default";
  const currentSuggestions = suggestions[pageKey] || suggestions.default;
  const _unused = context;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Bonjour ! Je suis votre assistant IA TerraMaps 🗺️\n\nJe peux vous aider avec :\n• Calculs topographiques\n• Systèmes de coordonnées\n• Import/Export de fichiers\n• Questions sur TerraMaps\n\nQue puis-je faire pour vous ?", time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev, { role: "user", content: msg, time }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, context }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.response, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Erreur de connexion. Réessayez.", time }]);
    }
    setLoading(false);
  }

  return (
    <>
      {/* Button */}
      <button onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 6, background: open ? "#F97316" : "#0f1923", border: "1px solid #1e3048", borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: open ? "#fff" : "#8bacc8", fontSize: 12, fontWeight: 600, transition: "all 0.2s" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
          <path d="M12 16v-4M12 8h.01"/>
        </svg>
        AI Assist
        {open && <span style={{ background: "#fff", color: "#F97316", fontSize: 9, padding: "1px 5px", borderRadius: 10, fontWeight: 700 }}>●</span>}
      </button>

      {/* Panel */}
      {open && (
        <div style={{ position: "fixed", right: 20, top: 70, width: 380, height: 560, background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 5000, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          
          {/* Header */}
          <div style={{ background: "#0D1117", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1E2D3D" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #F97316, #ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#E2EAF2" }}>TerraMaps AI</div>
                <div style={{ fontSize: 10, color: "#22C55E" }}>● En ligne</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "#64748B", cursor: "pointer", fontSize: 18 }}>×</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "85%", padding: "10px 14px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: m.role === "user" ? "#F97316" : "#0D1117",
                  border: m.role === "assistant" ? "1px solid #1E2D3D" : "none",
                  color: "#E2EAF2", fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap"
                }}>
                  {m.content}
                </div>
                <div style={{ fontSize: 10, color: "#4B6080", marginTop: 3 }}>{m.time}</div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <div style={{ background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: "16px 16px 16px 4px", padding: "10px 16px" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#F97316", animation: `bounce 1s infinite ${i * 0.2}s` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length < 3 && (
            <div style={{ padding: "0 12px 8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
              {currentSuggestions.slice(0, 3).map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)}
                  style={{ background: "#0D1117", border: "1px solid #1E2D3D", color: "#8BACC8", padding: "4px 10px", borderRadius: 20, cursor: "pointer", fontSize: 10, whiteSpace: "nowrap" }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: 12, borderTop: "1px solid #1E2D3D", display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Posez votre question..."
              disabled={loading}
              style={{ flex: 1, background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 10, padding: "9px 14px", color: "#E2EAF2", fontSize: 13, outline: "none" }}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
              style={{ background: input.trim() ? "#F97316" : "#1E2D3D", border: "none", borderRadius: 10, padding: "8px 14px", cursor: input.trim() ? "pointer" : "not-allowed", color: "#fff", fontSize: 13, fontWeight: 600 }}>
              ➤
            </button>
          </div>

          <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }`}</style>
        </div>
      )}
    </>
  );
}
