import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "terramaps-secret-2026");

export async function POST(req: NextRequest) {
  const token = req.cookies.get("tm_token")?.value;
  if (!token) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  try { await jwtVerify(token, SECRET); } catch { return NextResponse.json({ error: "Token invalide" }, { status: 401 }); }

  const { message, context } = await req.json();

  const systemPrompt = `Tu es un assistant expert en topographie et géomatique pour TerraMaps, une plateforme SaaS marocaine.
Tu aides les techniciens topographes avec :
- Les calculs de volumes de terrassement (déblai/remblai)
- Les coordonnées X, Y, Z et systèmes Lambert Maroc EPSG:26191
- Les formats CSV, GSI Leica, DXF, LandXML
- Le nivellement, polygonale, levé topographique
- Les normes marocaines de topographie
Réponds toujours en français de manière concise et professionnelle.
Contexte : ${context || "Aucun projet sélectionné"}`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ response: "Clé API Gemini non configurée. Ajoutez GEMINI_API_KEY dans Vercel." });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: message }] }],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
      }),
    }
  );

  const data = await response.json();
  console.log('Gemini:', JSON.stringify(data).slice(0,300));
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n'ai pas pu répondre.";
  return NextResponse.json({ response: text });
}

