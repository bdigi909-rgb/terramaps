"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import {
  MousePointer, Minus, Circle, Square, Type, Crosshair,
  ZoomIn, ZoomOut, RotateCcw, Grid, Trash2, X,
  Move, Pencil, Save, FolderOpen, Download,
  Undo, AlignCenter,
} from "lucide-react";

type Tool = "select" | "line" | "polyline" | "circle" | "rect" | "text" | "point" | "arc" | "move";

interface DrawPoint { x: number; y: number }
interface Entity {
  id: string; type: string; points: DrawPoint[]; color: string;
  lineWidth: number; text?: string; radius?: number; closed?: boolean;
}

const SNAP_GRID = 10;

function snapToGrid(val: number, snap: boolean) {
  if (!snap) return val;
  return Math.round(val / SNAP_GRID) * SNAP_GRID;
}

export default function CanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("select");
  const [entities, setEntities] = useState<Entity[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setProjects(data);
    });
  }, []);

  async function importFromProject(projectId: number) {
    const res = await fetch(`/api/projects/${projectId}/survey-points`);
    const pts = await res.json();
    if (!Array.isArray(pts) || pts.length === 0) return;
    
    const xs = pts.map((p: any) => p.x);
    const ys = pts.map((p: any) => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const scaleX = 600 / (maxX - minX || 1);
    const scaleY = 400 / (maxY - minY || 1);
    const scale = Math.min(scaleX, scaleY) * 0.8;
    
    const toCanvas = (p: any) => ({
      x: (p.x - minX) * scale + 100,
      y: 500 - (p.y - minY) * scale - 50,
    });

    const limPts = pts.filter((p: any) => p.code === "LIM");
    const newEntities: Entity[] = [];

    // Points
    pts.forEach((p: any) => {
      newEntities.push({
        id: Math.random().toString(36).slice(2),
        type: "point",
        points: [toCanvas(p)],
        color: p.code === "LIM" ? "#EF4444" : "#3B82F6",
        lineWidth: 2,
        text: p.name,
      });
    });

    // Polygone LIM
    if (limPts.length >= 2) {
      newEntities.push({
        id: Math.random().toString(36).slice(2),
        type: "polyline",
        points: [...limPts.map(toCanvas), toCanvas(limPts[0])],
        color: "#EF4444",
        lineWidth: 2,
        closed: true,
      });
    }

    setEntities(prev => [...prev, ...newEntities]);
    setShowImport(false);
  }
  const [drawing, setDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<DrawPoint[]>([]);
  const [mousePos, setMousePos] = useState<DrawPoint>({ x: 0, y: 0 });
  const [gridSnap, setGridSnap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [color, setColor] = useState("#f97316");
  const [lineWidth, setLineWidth] = useState(2);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<DrawPoint>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<DrawPoint>({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPos, setTextPos] = useState<DrawPoint>({ x: 0, y: 0 });
  const [undoStack, setUndoStack] = useState<Entity[][]>([]);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const toCanvas = useCallback((p: DrawPoint) => ({
    x: p.x * zoom + pan.x,
    y: p.y * zoom + pan.y,
  }), [zoom, pan]);

  const toWorld = useCallback((p: DrawPoint) => ({
    x: (p.x - pan.x) / zoom,
    y: (p.y - pan.y) / zoom,
  }), [zoom, pan]);

  const drawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#0a1520";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    if (showGrid) {
      const gridSize = SNAP_GRID * zoom;
      ctx.strokeStyle = "#162030";
      ctx.lineWidth = 0.5;
      const startX = pan.x % gridSize;
      const startY = pan.y % gridSize;
      for (let x = startX; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = startY; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
      // Major grid every 100 units
      const majorGrid = 100 * zoom;
      ctx.strokeStyle = "#1a2d45";
      ctx.lineWidth = 1;
      const mstartX = pan.x % majorGrid;
      const mstartY = pan.y % majorGrid;
      for (let x = mstartX; x < canvas.width; x += majorGrid) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = mstartY; y < canvas.height; y += majorGrid) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
    }

    // Origin crosshair
    const origin = toCanvas({ x: 0, y: 0 });
    ctx.strokeStyle = "#1e3048";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(origin.x - 20, origin.y); ctx.lineTo(origin.x + 20, origin.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(origin.x, origin.y - 20); ctx.lineTo(origin.x, origin.y + 20); ctx.stroke();

    // Draw entities
    entities.forEach((e) => {
      ctx.strokeStyle = selectedId === e.id ? "#ffffff" : e.color;
      ctx.lineWidth = e.lineWidth * zoom;
      ctx.fillStyle = e.color;

      if (e.type === "line" && e.points.length === 2) {
        const p1 = toCanvas(e.points[0]);
        const p2 = toCanvas(e.points[1]);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      } else if (e.type === "polyline" && e.points.length > 1) {
        ctx.beginPath();
        const first = toCanvas(e.points[0]);
        ctx.moveTo(first.x, first.y);
        e.points.slice(1).forEach((p) => { const c = toCanvas(p); ctx.lineTo(c.x, c.y); });
        if (e.closed) ctx.closePath();
        ctx.stroke();
      } else if (e.type === "circle" && e.points.length >= 1 && e.radius) {
        const center = toCanvas(e.points[0]);
        ctx.beginPath();
        ctx.arc(center.x, center.y, e.radius * zoom, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (e.type === "rect" && e.points.length === 2) {
        const p1 = toCanvas(e.points[0]);
        const p2 = toCanvas(e.points[1]);
        ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      } else if (e.type === "text" && e.points.length >= 1) {
        const p = toCanvas(e.points[0]);
        ctx.font = `${12 * zoom}px 'Inter', monospace`;
        ctx.fillStyle = e.color;
        ctx.fillText(e.text ?? "", p.x, p.y);
      } else if (e.type === "point" && e.points.length >= 1) {
        const p = toCanvas(e.points[0]);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
        ctx.fill();
        // Cross mark
        ctx.beginPath(); ctx.moveTo(p.x - 6, p.y); ctx.lineTo(p.x + 6, p.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(p.x, p.y - 6); ctx.lineTo(p.x, p.y + 6); ctx.stroke();
      }

      // Selection handles
      if (selectedId === e.id) {
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        e.points.forEach((p) => {
          const c = toCanvas(p);
          ctx.strokeRect(c.x - 4, c.y - 4, 8, 8);
        });
        ctx.setLineDash([]);
      }
    });

    // Preview current drawing
    if (drawing && currentPoints.length > 0) {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.setLineDash([6, 4]);

      const lastP = toCanvas(currentPoints[currentPoints.length - 1]);
      const mp = toCanvas(mousePos);

      if (tool === "line" || tool === "polyline") {
        ctx.beginPath();
        const fp = toCanvas(currentPoints[0]);
        ctx.moveTo(fp.x, fp.y);
        currentPoints.slice(1).forEach((p) => { const c = toCanvas(p); ctx.lineTo(c.x, c.y); });
        ctx.lineTo(mp.x, mp.y);
        ctx.stroke();
      } else if (tool === "circle") {
        const dx = mousePos.x - currentPoints[0].x;
        const dy = mousePos.y - currentPoints[0].y;
        const r = Math.sqrt(dx * dx + dy * dy);
        const center = toCanvas(currentPoints[0]);
        ctx.beginPath(); ctx.arc(center.x, center.y, r * zoom, 0, 2 * Math.PI); ctx.stroke();
        // Radius line
        ctx.beginPath(); ctx.moveTo(center.x, center.y); ctx.lineTo(mp.x, mp.y); ctx.stroke();
      } else if (tool === "rect") {
        const p1 = toCanvas(currentPoints[0]);
        ctx.strokeRect(p1.x, p1.y, mp.x - p1.x, mp.y - p1.y);
      }
      ctx.setLineDash([]);

      // Point markers
      currentPoints.forEach((p) => {
        const c = toCanvas(p);
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(c.x, c.y, 4, 0, 2 * Math.PI); ctx.fill();
      });
    }

    // Cursor crosshair
    ctx.strokeStyle = "#4b6080";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    const mx = toCanvas(mousePos);
    ctx.beginPath(); ctx.moveTo(mx.x - 10, mx.y); ctx.lineTo(mx.x + 10, mx.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx.x, mx.y - 10); ctx.lineTo(mx.x, mx.y + 10); ctx.stroke();

  }, [entities, drawing, currentPoints, mousePos, color, lineWidth, zoom, pan, showGrid, selectedId, toCanvas, tool]);

  useEffect(() => { drawAll(); }, [drawAll]);

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>): DrawPoint => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const raw = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const world = toWorld(raw);
    return { x: snapToGrid(world.x, gridSnap), y: snapToGrid(world.y, gridSnap) };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasPos(e);
    setMousePos(pos);
    setCoords(pos);

    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 0 && tool === "move")) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }
    const pos = getCanvasPos(e);

    if (tool === "select") {
      // Hit test
      let found = false;
      for (const ent of [...entities].reverse()) {
        if (ent.type === "point" && ent.points.length > 0) {
          const d = Math.sqrt((ent.points[0].x - pos.x) ** 2 + (ent.points[0].y - pos.y) ** 2);
          if (d < 10 / zoom) { setSelectedId(ent.id); found = true; break; }
        }
        if (ent.type === "text" && ent.points.length > 0) {
          const d = Math.sqrt((ent.points[0].x - pos.x) ** 2 + (ent.points[0].y - pos.y) ** 2);
          if (d < 20 / zoom) { setSelectedId(ent.id); found = true; break; }
        }
      }
      if (!found) setSelectedId(null);
      return;
    }

    if (tool === "text") {
      setTextPos(pos);
      setShowTextInput(true);
      return;
    }

    if (tool === "point") {
      const id = crypto.randomUUID();
      setUndoStack((prev) => [...prev, entities]);
      setEntities((prev) => [...prev, { id, type: "point", points: [pos], color, lineWidth }]);
      return;
    }

    if (!drawing) {
      setDrawing(true);
      setCurrentPoints([pos]);
    } else {
      if (tool === "line") {
        // Complete line
        const id = crypto.randomUUID();
        setUndoStack((prev) => [...prev, entities]);
        setEntities((prev) => [...prev, { id, type: "line", points: [currentPoints[0], pos], color, lineWidth }]);
        setDrawing(false);
        setCurrentPoints([]);
      } else if (tool === "polyline") {
        setCurrentPoints((prev) => [...prev, pos]);
      } else if (tool === "circle") {
        const dx = pos.x - currentPoints[0].x;
        const dy = pos.y - currentPoints[0].y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        const id = crypto.randomUUID();
        setUndoStack((prev) => [...prev, entities]);
        setEntities((prev) => [...prev, { id, type: "circle", points: [currentPoints[0]], color, lineWidth, radius }]);
        setDrawing(false);
        setCurrentPoints([]);
      } else if (tool === "rect") {
        const id = crypto.randomUUID();
        setUndoStack((prev) => [...prev, entities]);
        setEntities((prev) => [...prev, { id, type: "rect", points: [currentPoints[0], pos], color, lineWidth }]);
        setDrawing(false);
        setCurrentPoints([]);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || tool === "move") setIsPanning(false);
  };

  const handleDoubleClick = () => {
    if (tool === "polyline" && drawing && currentPoints.length > 1) {
      const id = crypto.randomUUID();
      setUndoStack((prev) => [...prev, entities]);
      setEntities((prev) => [...prev, { id, type: "polyline", points: currentPoints, color, lineWidth }]);
      setDrawing(false);
      setCurrentPoints([]);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const rect = canvasRef.current!.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    setZoom((prev) => {
      const next = Math.max(0.05, Math.min(20, prev * factor));
      setPan((p) => ({
        x: cx - (cx - p.x) * (next / prev),
        y: cy - (cy - p.y) * (next / prev),
      }));
      return next;
    });
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) { setShowTextInput(false); return; }
    const id = crypto.randomUUID();
    setUndoStack((prev) => [...prev, entities]);
    setEntities((prev) => [...prev, { id, type: "text", points: [textPos], color, lineWidth, text: textInput }]);
    setTextInput("");
    setShowTextInput(false);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setUndoStack((prev) => [...prev, entities]);
    setEntities((prev) => prev.filter((e) => e.id !== selectedId));
    setSelectedId(null);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setEntities(prev);
    setUndoStack((s) => s.slice(0, -1));
  };

  const clearAll = () => {
    if (!confirm("Effacer tous les objets du dessin?")) return;
    setUndoStack((prev) => [...prev, entities]);
    setEntities([]);
    setSelectedId(null);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 300, y: 300 });
  };

  const TOOLS: { id: Tool; icon: React.ComponentType<{ size?: number }>; label: string }[] = [
    { id: "select", icon: MousePointer, label: "Sélection (S)" },
    { id: "move", icon: Move, label: "Panoramique (P)" },
    { id: "point", icon: Crosshair, label: "Point (T)" },
    { id: "line", icon: Minus, label: "Ligne (L)" },
    { id: "polyline", icon: Pencil, label: "Polyligne (PL)" },
    { id: "circle", icon: Circle, label: "Cercle (C)" },
    { id: "rect", icon: Square, label: "Rectangle (R)" },
    { id: "text", icon: Type, label: "Texte (TX)" },
  ];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      switch (e.key.toLowerCase()) {
        case "s": setTool("select"); break;
        case "l": setTool("line"); break;
        case "c": setTool("circle"); break;
        case "r": setTool("rect"); break;
        case "p": setTool("move"); break;
        case "delete": case "backspace": deleteSelected(); break;
        case "escape":
          setDrawing(false); setCurrentPoints([]);
          setShowTextInput(false); break;
        case "z": if (e.ctrlKey || e.metaKey) undo(); break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  return (
    <AppShell>
      <Header
        title="Canvas de Dessin"
        subtitle="Éditeur CAO 2D — compatible DWG/DXF"
        actions={
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn-secondary" style={{ fontSize: 11 }} onClick={() => setShowImport(true)}>
              <FolderOpen size={12} /> Importer projet
            </button>
            {showImport && (
              <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24, minWidth: 300 }}>
                  <h3 style={{ margin: "0 0 16px", color: "#E2EAF2" }}>Importer un projet</h3>
                  {projects.map(p => (
                    <button key={p.id} onClick={() => importFromProject(p.id)}
                      style={{ display: "block", width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", color: "#E2EAF2", padding: "10px 16px", borderRadius: 8, cursor: "pointer", marginBottom: 8, textAlign: "left" }}>
                      📁 {p.name}
                    </button>
                  ))}
                  <button onClick={() => setShowImport(false)} style={{ background: "transparent", border: "none", color: "#64748B", cursor: "pointer", marginTop: 8 }}>Annuler</button>
                </div>
              </div>
            )}
            <button className="btn-secondary" style={{ fontSize: 11 }} onClick={() => {
              let dxf = "0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n";
              entities.forEach(e => {
                if (e.type === "line" && e.points.length >= 2) {
                  dxf += "0\nLINE\n8\n0\n10\n" + e.points[0].x + "\n20\n" + (-e.points[0].y) + "\n30\n0\n11\n" + e.points[1].x + "\n21\n" + (-e.points[1].y) + "\n31\n0\n";
                } else if (e.type === "circle" && e.radius) {
                  dxf += "0\nCIRCLE\n8\n0\n10\n" + e.points[0].x + "\n20\n" + (-e.points[0].y) + "\n30\n0\n40\n" + e.radius + "\n";
                } else if (e.type === "rect" && e.points.length >= 2) {
                  const x1 = e.points[0].x, y1 = -e.points[0].y, x2 = e.points[1].x, y2 = -e.points[1].y;
                  dxf += "0\nLWPOLYLINE\n8\n0\n90\n4\n70\n1\n10\n" + x1 + "\n20\n" + y1 + "\n10\n" + x2 + "\n20\n" + y1 + "\n10\n" + x2 + "\n20\n" + y2 + "\n10\n" + x1 + "\n20\n" + y2 + "\n";
                } else if (e.type === "polyline" && e.points.length >= 2) {
                  dxf += "0\nLWPOLYLINE\n8\n0\n90\n" + e.points.length + "\n70\n" + (e.closed ? "1" : "0") + "\n";
                  e.points.forEach(p => { dxf += "10\n" + p.x + "\n20\n" + (-p.y) + "\n"; });
                } else if (e.type === "text" && e.text) {
                  dxf += "0\nTEXT\n8\n0\n10\n" + e.points[0].x + "\n20\n" + (-e.points[0].y) + "\n30\n0\n40\n12\n1\n" + e.text + "\n";
                }
              });
              dxf += "0\nENDSEC\n0\nEOF\n";
              const blob = new Blob([dxf], { type: "application/dxf" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = "TerraMaps_Canvas.dxf"; a.click();
            }}>
              <Download size={12} /> Exporter DXF
            </button>
            <button className="btn-secondary" style={{ fontSize: 11 }} onClick={() => {
                const canvas = document.querySelector("canvas");
                if (!canvas) return;
                const win = window.open("");
                if (!win) return;
                win.document.write(`<html><head><title>TerraMaps — Plan</title><style>@page{size:A4 landscape;margin:10mm}body{margin:0}img{width:100%;height:auto}</style></head><body><img src="${canvas.toDataURL()}" /><script>window.onload=()=>{window.print();window.close()}<\/script></body></html>`);
                win.document.close();
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> Imprimer A4
              </button>
              <button className="btn-primary" style={{ fontSize: 11 }}>
                <Save size={12} /> Sauvegarder
              </button>
          </div>
        }
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left toolbar */}
        <div
          style={{
            width: 50, background: "#111c28", borderRight: "1px solid #1e3048",
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "8px 4px", gap: 4, flexShrink: 0,
          }}
        >
          {TOOLS.map((t) => (
            <button
              key={t.id}
              className={`tool-btn ${tool === t.id ? "active" : ""}`}
              onClick={() => { setTool(t.id); setDrawing(false); setCurrentPoints([]); }}
              title={t.label}
            >
              <t.icon size={16} />
            </button>
          ))}
          <div style={{ height: 1, background: "#1e3048", width: "80%", margin: "4px 0" }} />
          <button className="tool-btn" onClick={() => setZoom((z) => Math.min(z * 1.2, 20))} title="Zoom avant">
            <ZoomIn size={16} />
          </button>
          <button className="tool-btn" onClick={() => setZoom((z) => Math.max(z / 1.2, 0.05))} title="Zoom arrière">
            <ZoomOut size={16} />
          </button>
          <button className="tool-btn" onClick={resetView} title="Réinitialiser vue">
            <RotateCcw size={16} />
          </button>
          <div style={{ height: 1, background: "#1e3048", width: "80%", margin: "4px 0" }} />
          <button className={`tool-btn ${showGrid ? "active" : ""}`} onClick={() => setShowGrid((g) => !g)} title="Grille">
            <Grid size={16} />
          </button>
          <button className={`tool-btn ${gridSnap ? "active" : ""}`} onClick={() => setGridSnap((g) => !g)} title="Accrochage">
            <AlignCenter size={16} />
          </button>
          <div style={{ height: 1, background: "#1e3048", width: "80%", margin: "4px 0" }} />
          <button className="tool-btn" onClick={undo} title="Annuler (Ctrl+Z)">
            <Undo size={16} />
          </button>
          <button className="tool-btn" style={{ color: "#f87171" }} onClick={clearAll} title="Tout effacer">
            <Trash2 size={16} />
          </button>
          {selectedId && (
            <button className="tool-btn" style={{ color: "#f87171" }} onClick={deleteSelected} title="Supprimer sélection">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <canvas
            ref={canvasRef}
            width={2000}
            height={1200}
            className="srm-canvas"
            style={{ display: "block", width: "100%", height: "100%" }}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            onWheel={handleWheel}
            onContextMenu={(e) => e.preventDefault()}
          />

          {/* Text input overlay */}
          {showTextInput && (
            <div
              style={{
                position: "absolute",
                left: toCanvas(textPos).x,
                top: toCanvas(textPos).y - 30,
                zIndex: 100,
              }}
            >
              <input
                autoFocus
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleTextSubmit(); if (e.key === "Escape") { setShowTextInput(false); setTextInput(""); } }}
                style={{
                  background: "rgba(17,28,40,0.9)",
                  border: `1px solid ${color}`,
                  borderRadius: 4,
                  color,
                  padding: "4px 8px",
                  fontSize: 13,
                  fontFamily: "monospace",
                  minWidth: 120,
                  outline: "none",
                }}
                placeholder="Saisir texte + Enter"
              />
            </div>
          )}

          {/* Status bar */}
          <div
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "rgba(11,21,32,0.95)",
              borderTop: "1px solid #1e3048",
              padding: "4px 12px",
              display: "flex",
              gap: 20,
              fontSize: 11,
              color: "#4b6080",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#f97316", fontFamily: "monospace" }}>
              X: {coords.x.toFixed(2)} Y: {coords.y.toFixed(2)}
            </span>
            <span>Outil: <span style={{ color: "#8bacc8" }}>{tool}</span></span>
            <span>Zoom: <span style={{ color: "#8bacc8" }}>{(zoom * 100).toFixed(0)}%</span></span>
            <span>Entités: <span style={{ color: "#8bacc8" }}>{entities.length}</span></span>
            <span>Grille: <span style={{ color: gridSnap ? "#4ade80" : "#f87171" }}>{gridSnap ? "ON" : "OFF"}</span></span>
            {drawing && <span style={{ color: "#facc15" }}>En cours de dessin — Dbl-clic pour terminer</span>}
            {selectedId && <span style={{ color: "#60a5fa" }}>Objet sélectionné · Suppr pour effacer</span>}
          </div>
        </div>

        {/* Right panel */}
        <div
          style={{
            width: 220,
            background: "#111c28",
            borderLeft: "1px solid #1e3048",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          <div>
            <div className="section-title">Propriétés</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              <div>
                <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>Couleur</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["#f97316", "#3b82f6", "#10b981", "#facc15", "#ec4899", "#ffffff", "#4ade80", "#f87171"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      style={{
                        width: 20, height: 20, borderRadius: 4, background: c, border: "none", cursor: "pointer",
                        outline: color === c ? `2px solid white` : "none",
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </div>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: "100%", height: 28, marginTop: 4, borderRadius: 4, border: "1px solid #1e3048", background: "#0f1923", cursor: "pointer" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>
                  Épaisseur: {lineWidth}px
                </label>
                <input type="range" min={0.5} max={8} step={0.5} value={lineWidth} onChange={(e) => setLineWidth(parseFloat(e.target.value))} style={{ width: "100%", accentColor: color }} />
              </div>
            </div>
          </div>

          <div>
            <div className="section-title">Calques rapides</div>
            {[
              { name: "Tracé route", color: "#f97316" },
              { name: "Terrain naturel", color: "#10b981" },
              { name: "Bâti", color: "#8b5cf6" },
              { name: "Réseau EP", color: "#3b82f6" },
              { name: "Cotation", color: "#facc15" },
              { name: "Annotation", color: "#94a3b8" },
            ].map((layer) => (
              <div
                key={layer.name}
                onClick={() => setColor(layer.color)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 6px", borderRadius: 5, cursor: "pointer",
                  marginBottom: 2, background: color === layer.color ? "#1e3048" : "transparent",
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: 2, background: layer.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "#8bacc8" }}>{layer.name}</span>
              </div>
            ))}
          </div>

          <div>
            <div className="section-title">Objets ({entities.length})</div>
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {entities.slice().reverse().map((e) => (
                <div
                  key={e.id}
                  onClick={() => setSelectedId(selectedId === e.id ? null : e.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "4px 6px", borderRadius: 5, cursor: "pointer",
                    marginBottom: 2,
                    background: selectedId === e.id ? "#1e3048" : "transparent",
                    border: selectedId === e.id ? "1px solid #2a4060" : "1px solid transparent",
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: e.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: "#8bacc8", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.type}{e.text ? `: "${e.text}"` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="section-title">Raccourcis</div>
            <div style={{ fontSize: 10, color: "#4b6080", lineHeight: 1.8 }}>
              <div>S — Sélection</div>
              <div>L — Ligne</div>
              <div>C — Cercle</div>
              <div>R — Rectangle</div>
              <div>Ctrl+Z — Annuler</div>
              <div>Esc — Annuler opération</div>
              <div>Dbl-clic — Fin polyligne</div>
              <div>Molette — Zoom</div>
              <div>Clic milieu — Pan</div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
