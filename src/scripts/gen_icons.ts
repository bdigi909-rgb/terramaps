import * as fs from "fs";

const svg192 = `<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" rx="38" fill="#0D1117"/>
  <rect width="192" height="192" rx="38" fill="#F97316" opacity="0.15"/>
  <circle cx="96" cy="96" r="62" stroke="#F97316" stroke-width="6" fill="none"/>
  <ellipse cx="96" cy="96" rx="62" ry="22" stroke="#F97316" stroke-width="4" fill="none" opacity="0.5"/>
  <line x1="34" y1="96" x2="158" y2="96" stroke="#F97316" stroke-width="3" opacity="0.4"/>
  <ellipse cx="96" cy="96" rx="30" ry="62" stroke="#F97316" stroke-width="5" fill="none"/>
  <circle cx="114" cy="66" r="14" fill="#F97316"/>
  <circle cx="114" cy="66" r="6" fill="white"/>
  <line x1="114" y1="80" x2="114" y2="96" stroke="#F97316" stroke-width="5"/>
  <text x="96" y="155" text-anchor="middle" fill="#F97316" font-size="18" font-weight="bold" font-family="Arial">TerraMaps</text>
</svg>`;

const svg512 = svg192.replace('width="192" height="192" viewBox="0 0 192 192"', 'width="512" height="512" viewBox="0 0 192 192"');

fs.writeFileSync("public/icon-192.svg", svg192);
fs.writeFileSync("public/icon-512.svg", svg512);
console.log("✅ Icônes SVG créées !");
console.log("Note: Pour la production, convertissez en PNG avec un outil en ligne.");
