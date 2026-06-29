import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "terramaps-secret-2026");
export async function GET(req: NextRequest) {
  const token = req.cookies.get("tm_token")?.value;
  if (!token) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return NextResponse.json({ user: payload });
  } catch {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }
}
