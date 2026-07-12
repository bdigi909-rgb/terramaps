"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";

interface Photo {
  id: number;
  project_id: number;
  user_name: string;
  filename: string;
  description: string;
  created_at: string;
}

export default function PhotosPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<number>(0);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fullscreen, setFullscreen] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/login"); return; }
    });
    fetch("/api/projects").then(r => r.json()).then(d => {
      if (Array.isArray(d)) setProjects(d);
    });
  }, []);

  useEffect(() => {
    if (selectedProject) loadPhotos();
  }, [selectedProject]);

  async function loadPhotos() {
    const res = await fetch(`/api/photos?projectId=${selectedProject}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setPhotos(data);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function uploadPhoto() {
    if (!selectedFile || !selectedProject) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const data = reader.result as string;
      await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject,
          filename: selectedFile.name,
          data,
          description
        })
      });
      setPreview("");
      setSelectedFile(null);
      setDescription("");
      if (fileRef.current) fileRef.current.value = "";
      await loadPhotos();
      setUploading(false);
    };
    reader.readAsDataURL(selectedFile);
  }

  async function deletePhoto(id: number) {
    await fetch("/api/photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    setPhotos(prev => prev.filter(p => p.id !== id));
  }

  return (
    <AppShell>
      <Header title="Photos Terrain" subtitle="Gérez les photos de vos missions terrain" />
      <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>

        {/* Sélection projet */}
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Projet</label>
          <select value={selectedProject} onChange={e => setSelectedProject(parseInt(e.target.value))}
            style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 12px", color: "#E2EAF2", fontSize: 14 }}>
            <option value={0}>-- Sélectionnez un projet --</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {selectedProject > 0 && (
          <>
            {/* Upload */}
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#8BACC8" }}>📸 Ajouter une photo</h3>
              <div style={{ display: "grid", gridTemplateColumns: preview ? "1fr 1fr" : "1fr", gap: 16 }}>
                <div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFile}
                    style={{ width: "100%", background: "#0D1117", border: "2px dashed #1E2D3D", borderRadius: 8, padding: "20px", color: "#8BACC8", fontSize: 13, cursor: "pointer", boxSizing: "border-box" }} />
                  <input value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Description (optionnel)..."
                    style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 12px", color: "#E2EAF2", fontSize: 13, marginTop: 8, boxSizing: "border-box" }} />
                  <button onClick={uploadPhoto} disabled={!selectedFile || uploading}
                    style={{ width: "100%", background: selectedFile ? "#F97316" : "#1E2D3D", border: "none", borderRadius: 8, padding: "12px", color: "#fff", fontSize: 14, fontWeight: 600, cursor: selectedFile ? "pointer" : "not-allowed", marginTop: 8 }}>
                    {uploading ? "Envoi en cours..." : "📤 Uploader la photo"}
                  </button>
                </div>
                {preview && (
                  <div>
                    <img src={preview} alt="Preview" style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 8, border: "1px solid #1E2D3D" }} />
                  </div>
                )}
              </div>
            </div>

            {/* Galerie */}
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#8BACC8" }}>🖼️ Galerie ({photos.length} photos)</h3>
              {photos.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#64748B" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
                  <div>Aucune photo pour ce projet</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                  {photos.map(p => (
                    <div key={p.id} style={{ background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ position: "relative" }}>
                        <img src={p.data} alt={p.filename}
                          onClick={() => setFullscreen(`/api/photos/${p.id}/image`)}
                          style={{ width: "100%", height: 150, objectFit: "cover", cursor: "pointer" }}
                          onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                      </div>
                      <div style={{ padding: 10 }}>
                        {p.description && <div style={{ fontSize: 12, color: "#8BACC8", marginBottom: 4 }}>{p.description}</div>}
                        <div style={{ fontSize: 10, color: "#64748B" }}>{p.user_name} — {new Date(p.created_at).toLocaleDateString("fr-FR")}</div>
                        <button onClick={() => deletePhoto(p.id)}
                          style={{ marginTop: 8, background: "transparent", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11 }}>
                          🗑️ Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Fullscreen */}
        {fullscreen && (
          <div onClick={() => setFullscreen("")}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <img src={fullscreen} alt="Fullscreen" style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 8 }} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
