"use client";
import { useState, useEffect, useRef } from "react";

interface Photo {
  id: number;
  user_name: string;
  filename: string;
  description: string;
  data: string;
  created_at: string;
}

export default function PhotosTab({ projectId }: { projectId: number }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [fullscreen, setFullscreen] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadPhotos(); }, [projectId]);

  async function loadPhotos() {
    const res = await fetch(`/api/photos?projectId=${projectId}`);
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
    if (!selectedFile) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, filename: selectedFile.name, data: reader.result, description })
      });
      setPreview(""); setSelectedFile(null); setDescription("");
      if (fileRef.current) fileRef.current.value = "";
      await loadPhotos();
      setUploading(false);
    };
    reader.readAsDataURL(selectedFile);
  }

  async function deletePhoto(id: number) {
    await fetch("/api/photos", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setPhotos(prev => prev.filter(p => p.id !== id));
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile}
          style={{ background: "#0D1117", border: "2px dashed #1E2D3D", borderRadius: 8, padding: "10px", color: "#8BACC8", fontSize: 13, cursor: "pointer" }} />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description..."
          style={{ flex: 1, background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 12px", color: "#E2EAF2", fontSize: 13, minWidth: 150 }} />
        <button onClick={uploadPhoto} disabled={!selectedFile || uploading}
          style={{ background: selectedFile ? "#F97316" : "#1E2D3D", border: "none", borderRadius: 8, padding: "10px 16px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: selectedFile ? "pointer" : "not-allowed" }}>
          {uploading ? "Envoi..." : "📤 Uploader"}
        </button>
      </div>
      {preview && <img src={preview} alt="preview" style={{ height: 100, borderRadius: 8, marginBottom: 16, objectFit: "cover" }} />}
      {photos.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#64748B" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📷</div>
          <div>Aucune photo — uploadez la première !</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
          {photos.map(p => (
            <div key={p.id} style={{ background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 10, overflow: "hidden" }}>
              <img src={p.data} alt={p.filename} onClick={() => setFullscreen(p.data)}
                style={{ width: "100%", height: 130, objectFit: "cover", cursor: "pointer" }} />
              <div style={{ padding: 8 }}>
                {p.description && <div style={{ fontSize: 11, color: "#8BACC8", marginBottom: 4 }}>{p.description}</div>}
                <div style={{ fontSize: 10, color: "#64748B" }}>{p.user_name} — {new Date(p.created_at).toLocaleDateString("fr-FR")}</div>
                <button onClick={() => deletePhoto(p.id)}
                  style={{ marginTop: 6, background: "transparent", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 10 }}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {fullscreen && (
        <div onClick={() => setFullscreen("")}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <img src={fullscreen} alt="fs" style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
}
