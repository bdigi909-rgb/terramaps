"use client";
import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import Link from "next/link";

interface Mission {
  id: number;
  titre: string;
  projet: string;
  technicien: string;
  date: string;
  statut: "planifiee" | "en_cours" | "terminee" | "annulee";
  couleur: string;
}

const COULEURS = ["#F97316", "#3B82F6", "#22C55E", "#A855F7", "#EF4444", "#F59E0B"];
const STATUTS = {
  planifiee: { label: "Planifiée", color: "#3B82F6" },
  en_cours: { label: "En cours", color: "#F97316" },
  terminee: { label: "Terminée", color: "#22C55E" },
  annulee: { label: "Annulée", color: "#EF4444" },
};

export default function PlanningPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [form, setForm] = useState({
    titre: "", projet: "", technicien: "", date: "", statut: "planifiee" as Mission["statut"], couleur: "#F97316"
  });

  useEffect(() => {
    const saved = localStorage.getItem("tm_missions");
    if (saved) setMissions(JSON.parse(saved));
    fetch("/api/projects").then(r => r.json()).then(d => { if (Array.isArray(d)) setProjects(d); });
    fetch("/api/users").then(r => r.json()).then(d => { if (Array.isArray(d)) setUsers(d); });
  }, []);

  function saveMissions(m: Mission[]) {
    setMissions(m);
    localStorage.setItem("tm_missions", JSON.stringify(m));
  }
  function addMission() {
    if (!form.titre || !form.date) return;
    const newMission: Mission = { id: Date.now(), ...form };
    saveMissions([...missions, newMission]);
    // Notification
    fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Nouvelle mission planifiee",
        message: form.titre + (form.technicien ? " — " + form.technicien : "") + " — " + form.date,
        type: "info",
        userId: 1
      })
    });
    setForm({ titre: "", projet: "", technicien: "", date: "", statut: "planifiee", couleur: "#F97316" });
    setShowForm(false);
  }

  function deleteMission(id: number) {
    saveMissions(missions.filter(m => m.id !== id));
  }

  function updateStatut(id: number, statut: Mission["statut"]) {
    saveMissions(missions.map(m => m.id === id ? { ...m, statut } : m));
  }

  // Calendrier
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  function getMissionsForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return missions.filter(m => m.date === dateStr);
  }

  return (
    <AppShell>
      <Header title="Planning" subtitle="Calendrier des missions terrain"
        actions={
          <button onClick={() => setShowForm(true)} className="btn-primary" style={{ fontSize: 12 }}>
            + Nouvelle mission
          </button>
        }
      />
      <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {Object.entries(STATUTS).map(([key, val]) => (
            <div key={key} style={{ background: "#161B22", border: `1px solid ${val.color}33`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: val.color }}>
                {missions.filter(m => m.statut === key).length}
              </div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{val.label}</div>
            </div>
          ))}
        </div>

        {/* Calendrier */}
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <button onClick={() => setCurrentMonth(new Date(year, month - 1))}
              style={{ background: "#0D1117", border: "1px solid #1E2D3D", color: "#E2EAF2", padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}>←</button>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#E2EAF2", textTransform: "capitalize" }}>{monthName}</h3>
            <button onClick={() => setCurrentMonth(new Date(year, month + 1))}
              style={{ background: "#0D1117", border: "1px solid #1E2D3D", color: "#E2EAF2", padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}>→</button>
          </div>

          {/* Jours semaine */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
            {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 11, color: "#64748B", fontWeight: 600, padding: "4px 0" }}>{d}</div>
            ))}
          </div>

          {/* Grille calendrier */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayMissions = getMissionsForDay(day);
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
              return (
                <div key={day} onClick={() => {
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  setForm(f => ({ ...f, date: dateStr }));
                  setShowForm(true);
                }}
                  style={{ minHeight: 60, background: isToday ? "#0D47A133" : "#0D1117", border: `1px solid ${isToday ? "#3B82F6" : "#1E2D3D"}`, borderRadius: 6, padding: 4, cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#1E2D3D")}
                  onMouseLeave={e => (e.currentTarget.style.background = isToday ? "#0D47A133" : "#0D1117")}>
                  <div style={{ fontSize: 11, fontWeight: isToday ? 700 : 400, color: isToday ? "#3B82F6" : "#64748B", marginBottom: 2 }}>{day}</div>
                  {dayMissions.map(m => (
                    <div key={m.id} style={{ background: m.couleur, borderRadius: 3, padding: "1px 4px", fontSize: 9, color: "#fff", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.titre}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Liste missions */}
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#8BACC8" }}>📋 Toutes les missions ({missions.length})</h3>
          {missions.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, color: "#64748B" }}>Aucune mission planifiée</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                  {["Titre", "Projet", "Technicien", "Date", "Statut", "Actions"].map(h => (
                    <th key={h} style={{ padding: "8px 10px", color: "#64748B", textAlign: "left", fontSize: 10, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {missions.sort((a, b) => a.date.localeCompare(b.date)).map(m => (
                  <tr key={m.id} style={{ borderBottom: "1px solid #0D1117" }}>
                    <td style={{ padding: "8px 10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.couleur, flexShrink: 0 }} />
                        <span style={{ color: "#E2EAF2", fontWeight: 600 }}>{m.titre}</span>
                      </div>
                    </td>
                    <td style={{ padding: "8px 10px", color: "#8BACC8" }}>{m.projet || "—"}</td>
                    <td style={{ padding: "8px 10px", color: "#8BACC8" }}>{m.technicien || "—"}</td>
                    <td style={{ padding: "8px 10px", color: "#64748B" }}>{m.date}</td>
                    <td style={{ padding: "8px 10px" }}>
                      <select value={m.statut} onChange={e => updateStatut(m.id, e.target.value as Mission["statut"])}
                        style={{ background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 6, padding: "3px 6px", color: STATUTS[m.statut].color, fontSize: 11 }}>
                        {Object.entries(STATUTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      <button onClick={() => deleteMission(m.id)} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal nouvelle mission */}
        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: 28, minWidth: 380, maxWidth: 500, width: "100%" }}>
              <h3 style={{ margin: "0 0 20px", fontSize: 16, color: "#E2EAF2" }}>📅 Nouvelle mission</h3>
              {[
                { key: "titre", label: "Titre de la mission", type: "text", placeholder: "Levé terrain RN9..." },
                { key: "date", label: "Date", type: "date", placeholder: "" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4, textTransform: "uppercase" }}>{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13, boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4, textTransform: "uppercase" }}>Projet</label>
                <select value={form.projet} onChange={e => setForm(p => ({ ...p, projet: e.target.value }))}
                  style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13 }}>
                  <option value="">-- Sélectionnez --</option>
                  {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4, textTransform: "uppercase" }}>Technicien</label>
                <select value={form.technicien} onChange={e => setForm(p => ({ ...p, technicien: e.target.value }))}
                  style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13 }}>
                  <option value="">-- Sélectionnez --</option>
                  {users.map(u => <option key={u.id} value={u.name}>{u.name} ({u.role})</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Couleur</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {COULEURS.map(c => (
                    <div key={c} onClick={() => setForm(p => ({ ...p, couleur: c }))}
                      style={{ width: 24, height: 24, borderRadius: "50%", background: c, cursor: "pointer", border: form.couleur === c ? "3px solid #fff" : "2px solid transparent" }} />
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, background: "transparent", border: "1px solid #1E2D3D", color: "#64748B", padding: "10px", borderRadius: 8, cursor: "pointer" }}>Annuler</button>
                <button onClick={addMission} style={{ flex: 2, background: "#F97316", border: "none", color: "#fff", padding: "10px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>✅ Ajouter</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
