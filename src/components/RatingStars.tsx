"use client";
import { useState, useEffect } from "react";

export default function RatingStars({ projectId }: { projectId: number }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [average, setAverage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/ratings?projectId=${projectId}`).then(r => r.json()).then(d => {
      if (d.average && parseFloat(d.average) > 0) {
        setAverage(d.average);
        setSubmitted(true);
      }
    });
  }, [projectId]);

  async function submitRating() {
    if (!rating) return;
    await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, rating, comment })
    });
    setSubmitted(true);
    setAverage(rating.toString());
  }

  if (submitted) return (
    <div style={{ fontSize: 11, color: "#F97316", marginTop: 4 }}>
      ⭐ Note : {average}/5
    </div>
  );

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {[1,2,3,4,5].map(star => (
          <span key={star} onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
            style={{ cursor: "pointer", fontSize: 20, color: star <= (hover || rating) ? "#F97316" : "#1E2D3D" }}>
            ★
          </span>
        ))}
      </div>
      {rating > 0 && (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Commentaire (optionnel)"
            style={{ flex: 1, background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 6, padding: "4px 8px", color: "#E2EAF2", fontSize: 11 }} />
          <button onClick={submitRating}
            style={{ background: "#F97316", border: "none", color: "#fff", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
            ✅ Noter
          </button>
        </div>
      )}
    </div>
  );
}
