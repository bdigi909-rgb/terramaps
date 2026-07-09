"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<any>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults(null); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
      setOpen(true);
      setLoading(false);
    }, 300);
  }, [query]);

  const total = results ? results.projects?.length + results.points?.length + results.users?.length + (results.devis?.length||0) + (results.factures?.length||0) : 0;

  function navigate(href: string) {
    router.push(href);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={ref} style={{ position: "relative", flex: 1, maxWidth: 400 }}>
      <div style={{ position: "relative" }}>
        <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748B" }}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results && setOpen(true)}
          placeholder="Rechercher projets, points, clients..." className="tm-search-input"
          style={{
            width: "100%", background: "#0D1117", border: "1px solid #1E2D3D",
            borderRadius: 10, padding: "9px 14px 9px 38px", color: "#E2EAF2",
            fontSize: 13, outline: "none", boxSizing: "border-box",
            transition: "border-color 0.2s", colorScheme: "dark"
          }}
        />
        {loading && (
          <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#F97316", fontSize: 11 }}>
            ⟳
          </div>
        )}
      </div>

      {open && results && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 9999,
          background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)", overflow: "hidden"
        }}>
          {total === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#64748B", fontSize: 13 }}>
              Aucun résultat pour "{query}"
            </div>
          ) : (
            <>
              {results.projects?.length > 0 && (
                <div>
                  <div style={{ padding: "8px 14px 4px", fontSize: 10, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                    📁 Projets
                  </div>
                  {results.projects.map((p: any) => (
                    <div key={p.id} onClick={() => navigate(`/projects`)}
                      style={{ padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #0D1117" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#1E2D3D")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <span style={{ fontSize: 16 }}>📁</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#E2EAF2" }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "#64748B" }}>{p.client} · {p.location}</div>
                      </div>
                      <span style={{ marginLeft: "auto", fontSize: 10, color: p.status === "active" ? "#22C55E" : "#64748B", fontWeight: 600, textTransform: "uppercase" }}>{p.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {results.points?.length > 0 && (
                <div>
                  <div style={{ padding: "8px 14px 4px", fontSize: 10, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                    📍 Points topo
                  </div>
                  {results.points.map((p: any) => (
                    <div key={p.id} onClick={() => navigate(`/survey`)}
                      style={{ padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #0D1117" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#1E2D3D")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <span style={{ fontSize: 16 }}>📍</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#E2EAF2" }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "#64748B" }}>Code: {p.code} · X:{p.x?.toFixed(2)} Y:{p.y?.toFixed(2)} Z:{p.z?.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.users?.length > 0 && (
                <div>
                  <div style={{ padding: "8px 14px 4px", fontSize: 10, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                    👥 Utilisateurs
                  </div>
                  {results.users.map((u: any) => (
                    <div key={u.id} onClick={() => navigate(`/admin`)}
                      style={{ padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#1E2D3D")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(249,115,22,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#F97316" }}>
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#E2EAF2" }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: "#64748B" }}>{u.email} · {u.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {results.devis?.length > 0 && (
                <div>
                  <div style={{ padding: "6px 14px", fontSize: 10, color: "#64748B", fontWeight: 700, textTransform: "uppercase", background: "#0D1117" }}>Devis</div>
                  {results.devis.map((d: any) => (
                    <div key={d.id} onClick={() => navigate("/finance")}
                      style={{ padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#1E2D3D")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <span style={{ fontSize: 16 }}>📋</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#E2EAF2" }}>{d.numero}</div>
                        <div style={{ fontSize: 11, color: "#64748B" }}>{d.client} · {(d.total||0).toFixed(2)} MAD</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {results.factures?.length > 0 && (
                <div>
                  <div style={{ padding: "6px 14px", fontSize: 10, color: "#64748B", fontWeight: 700, textTransform: "uppercase", background: "#0D1117" }}>Factures</div>
                  {results.factures.map((f: any) => (
                    <div key={f.id} onClick={() => navigate("/finance")}
                      style={{ padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#1E2D3D")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <span style={{ fontSize: 16 }}>🧾</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#E2EAF2" }}>{f.numero}</div>
                        <div style={{ fontSize: 11, color: "#64748B" }}>{f.client} · {(f.total||0).toFixed(2)} MAD</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ padding: "8px 14px", borderTop: "1px solid #1E2D3D", fontSize: 11, color: "#4B6080", textAlign: "center" }}>
                {total} résultat{total > 1 ? "s" : ""} pour "{query}"
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
