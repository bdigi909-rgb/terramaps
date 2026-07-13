import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "terramaps-secret-2026");

export async function GET(req: NextRequest) {
  const token = req.cookies.get("tm_token")?.value;
  if (!token) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const [user] = await db.select().from(users).where(eq(users.id, payload.id as number));
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 401 });
    return NextResponse.json({ user: { ...payload, company: (user as any).company } });
  } catch {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }
}
