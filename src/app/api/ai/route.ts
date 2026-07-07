import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "terramaps-secret-2026");

export async function POST(req: NextRequest) {
  const token = req.cookies.get("tm_token")?.value;
  if (!token) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  try { await jwtVerify(token, SECRET); } catch { return NextResponse.json({ error: "Token invalide" }, { status: 401 }); }

  const { message, context } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ response: "Clé GEMINI_API_KEY manquante dans Vercel." });

  const systemPrompt = `Tu es un assistant expert en topographie pour TerraMaps Maroc. Reponds en francais. Contexte: ${context || "aucun"}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
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
    console.log("Gemini status:", response.status);
    console.log("Gemini data:", JSON.stringify(data).slice(0, 500));
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text 
      || data.error?.message 
      || "Pas de reponse de Gemini";
    
    return NextResponse.json({ response: text });
  } catch (err: any) {
    console.error("Gemini error:", err.message);
    return NextResponse.json({ response: "Erreur: " + err.message });
  }
}
