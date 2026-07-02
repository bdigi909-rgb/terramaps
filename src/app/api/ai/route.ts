import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "terramaps-secret-2026");

export async function POST(req: NextRequest) {
  const token = req.cookies.get("tm_token")?.value;
  if (!token) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  try { await jwtVerify(token, SECRET); } catch { return NextResponse.json({ error: "Token invalide" }, { status: 401 }); }

  const { message, context } = await req.json();

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: `Tu es un assistant expert en topographie et géomatique pour TerraMaps, une plateforme SaaS marocaine de topographie et cartographie. 
Tu aides les techniciens topographes et ingénieurs avec :
- Les calculs de volumes de terrassement (déblai/remblai)
- L'interprétation des coordonnées X, Y, Z
- Les systèmes de coordonnées (Lambert Maroc EPSG:26191, WGS84, UTM)
- Les formats de fichiers topographiques (CSV, GSI Leica, DXF, LandXML)
- Les normes marocaines de topographie
- L'utilisation de TerraMaps
Réponds toujours en français de manière concise et professionnelle.
Contexte du projet actuel : ${context || "Aucun projet sélectionné"}`,
      messages: [{ role: "user", content: message }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || "Désolé, je n'ai pas pu répondre.";
  return NextResponse.json({ response: text });
}
