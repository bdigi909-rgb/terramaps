"use client";
import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";

interface Tarif {
  id: number;
  categorie: string;
  prestation: string;
  unite: string;
  prix: number;
  tva: number;
  description: string;
}

const CATEGORIES = ["Levé topographique", "Documents officiels", "Calculs", "Déplacement", "Autre"];

export default function TarifsPage() {
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    categorie: "Levé topographique", prestation: "", unite: "Forfait", prix: "", tva: "20", description: ""
  });

  useEffect(() => {
    const saved = localStorage.getItem("tm_tarifs");
    if (saved) setTarifs(JSON.parse(saved));
    else {
      // Tarifs par défaut
      const defaults: Tarif[] = [
        { id: 1, categorie: "Levé topographique", prestation: "Levé topographique < 1 Ha", unite: "Forfait", prix: 3000, tva: 20, description: "Levé complet avec rapport" },
        { id: 2, categorie: "Levé topographique", prestation: "Levé topographique 1-5 Ha", unite: "Forfait", prix: 5000, tva: 20, description: "Levé complet avec rapport" },
        { id: 3, categorie: "Documents officiels", prestation: "Rapport PDF officiel", unite: "Forfait", prix: 500, tva: 20, description: "Document officiel Royaume du Maroc" },
        { id: 4, categorie: "Documents officiels", prestation: "Levé topo certifié", unite: "Forfait", prix: 800, tva: 20, description: "Avec cachet et signature" },
        { id: 5, categorie: "Calculs", prestation: "Canevas de nivellement", unite: "Forfait", prix: 1500, tva: 20, description: "Avec compensation" },
        { id: 6, categorie: "Calculs", prestation: "Polygonale", unite: "Forfait", prix: 2000, tva: 20, description: "Avec compensation Bowditch" },
        { id: 7, categorie: "Déplacement", prestation: "Frais de déplacement", unite: "km", prix: 5, tva: 20, description: "Par kilomètre" },
      ];
      setTarifs(defaults);
      localStorage.setItem("tm_tarifs", JSON.stringify(defaults));
    }
  }, []);

  function saveTarifs(t: Tarif[]) {
    setTarifs(t);
    localStorage.setItem("tm_tarifs", JSON.stringify(t));
  }

  function addTarif() {
    if (!form.prestation || !form.prix) return;
    if (editId !== null) {
      saveTarifs(tarifs.map(t => t.id === editId ? { ...t, ...form, prix: parseFloat(form.prix), tva: parseFloat(form.tva) } : t));
      setEditId(null);
    } else {
      saveTarifs([...tarifs, { id: Date.now(), ...form, prix: parseFloat(form.prix), tva: parseFloat(form.tva) }]);
    }
    setForm({ categorie: "Levé topographique", prestation: "", unite: "Forfait", prix: "", tva: "20", description: "" });
    setShowForm(false);
  }

  function editTarif(t: Tarif) {
    setForm({ categorie: t.categorie, prestation: t.prestation, unite: t.unite, prix: String(t.prix), tva: String(t.tva), description: t.description });
    setEditId(t.id);
    setShowForm(true);
  }

  function deleteTarif(id: number) {
    saveTarifs(tarifs.filter(t => t.id !== id));
  }

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = tarifs.filter(t => t.categorie === cat);
    return acc;
  }, {} as Record<string, Tarif[]>);

  return (
    <AppShell>
      <Header title="Tarifs" subtitle="Grille tarifaire du cabinet"
        actions={
          <button onClick={() => { setEditId(null); setShowForm(true); }} className="btn-primary" style={{ fontSize: 12 }}>
            + Nouveau tarif
          </button>
        }
      />
      <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏷️</div>
          <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>Grille tarifaire</h1>
          <p style={{ color: "#64748B", fontSize: 13 }}>Ces tarifs sont utilisés automatiquement dans vos devis</p>
        </div>

        {CATEGORIES.map(cat => (
          grouped[cat]?.length > 0 && (
            <div key={cat} style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#F97316", fontWeight: 700 }}>📁 {cat}</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                    {["Prestation", "Unité", "Prix HT", "TVA", "Prix TTC", "Actions"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", color: "#64748B", textAlign: "left", fontSize: 10, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grouped[cat].map(t => (
                    <tr key={t.id} style={{ borderBottom: "1px solid #0D1117" }}>
                      <td style={{ padding: "8px 10px" }}>
                        <div style={{ color: "#E2EAF2", fontWeight: 600 }}>{t.prestation}</div>
                        {t.description && <div style={{ color: "#64748B", fontSize: 10, marginTop: 2 }}>{t.description}</div>}
                      </td>
                      <td style={{ padding: "8px 10px", color: "#8BACC8" }}>{t.unite}</td>
                      <td style={{ padding: "8px 10px", color: "#22C55E", fontFamily: "monospace", fontWeight: 700 }}>{t.prix.toFixed(2)} MAD</td>
                      <td style={{ padding: "8px 10px", color: "#64748B" }}>{t.tva}%</td>
                      <td style={{ padding: "8px 10px", color: "#F97316", fontFamily: "monospace", fontWeight: 700 }}>{(t.prix * (1 + t.tva / 100)).toFixed(2)} MAD</td>
                      <td style={{ padding: "8px 10px", display: "flex", gap: 6 }}>
                        <button onClick={() => editTarif(t)} style={{ background: "transparent", border: "1px solid #1E2D3D", color: "#3B82F6", padding: "3px 8px", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>✏️</button>
                        <button onClick={() => deleteTarif(t.id)} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ))}

        {/* Modal */}
        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: 28, minWidth: 400, maxWidth: 500, width: "100%" }}>
              <h3 style={{ margin: "0 0 20px", fontSize: 16, color: "#E2EAF2" }}>{editId ? "✏️ Modifier" : "🏷️ Nouveau"} tarif</h3>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4, textTransform: "uppercase" }}>Catégorie</label>
                <select value={form.categorie} onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))}
                  style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13 }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {[
                { key: "prestation", label: "Prestation", placeholder: "Levé topographique..." },
                { key: "description", label: "Description", placeholder: "Description courte..." },
                { key: "unite", label: "Unité", placeholder: "Forfait, m², km..." },
                { key: "prix", label: "Prix HT (MAD)", placeholder: "3000" },
                { key: "tva", label: "TVA (%)", placeholder: "20" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4, textTransform: "uppercase" }}>{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13, boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button onClick={() => { setShowForm(false); setEditId(null); }} style={{ flex: 1, background: "transparent", border: "1px solid #1E2D3D", color: "#64748B", padding: "10px", borderRadius: 8, cursor: "pointer" }}>Annuler</button>
                <button onClick={addTarif} style={{ flex: 2, background: "#F97316", border: "none", color: "#fff", padding: "10px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>
                  {editId ? "✅ Modifier" : "✅ Ajouter"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
