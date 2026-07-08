"use client";
import { useRef, useEffect, useState } from "react";

interface Props {
  onSignature: (dataUrl: string) => void;
}

export default function SignaturePad({ onSignature }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }, []);

  function getPos(e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as MouseEvent).clientX - rect.left, y: (e as MouseEvent).clientY - rect.top };
  }

  function startDraw(e: any) {
    drawing.current = true;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e: any) {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setSigned(true);
  }

  function stopDraw() {
    drawing.current = false;
    if (signed && canvasRef.current) {
      onSignature(canvasRef.current.toDataURL("image/png"));
    }
  }

  function clear() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSigned(false);
    onSignature("");
  }

  return (
    <div>
      <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6, fontWeight: 600, textTransform: "uppercase" }}>Signature du technicien</div>
      <div style={{ border: "1px solid #1E2D3D", borderRadius: 8, overflow: "hidden", display: "inline-block" }}>
        <canvas
          ref={canvasRef}
          width={280} height={80}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
          style={{ display: "block", cursor: "crosshair", background: "#fff" }}
        />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <button onClick={clear} style={{ background: "transparent", border: "1px solid #EF4444", color: "#EF4444", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>
          🗑️ Effacer
        </button>
        {signed && <span style={{ fontSize: 11, color: "#22C55E", padding: "4px 0" }}>✅ Signature enregistrée</span>}
      </div>
    </div>
  );
}
