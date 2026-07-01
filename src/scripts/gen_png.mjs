import { createCanvas } from "canvas";
import { writeFileSync } from "fs";

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  
  // Background
  ctx.fillStyle = "#0D1117";
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();
  
  // Globe circle
  const cx = size / 2, cy = size / 2, r = size * 0.35;
  ctx.strokeStyle = "#F97316";
  ctx.lineWidth = size * 0.04;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  
  // Meridian
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.5, r, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // Equator
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.35, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  
  // Pin
  ctx.fillStyle = "#F97316";
  ctx.beginPath();
  ctx.arc(cx + r * 0.35, cy - r * 0.35, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(cx + r * 0.35, cy - r * 0.35, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toBuffer("image/png");
}

writeFileSync("public/icon-192.png", createIcon(192));
writeFileSync("public/icon-512.png", createIcon(512));
console.log("✅ PNG icons created!");
