import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "terramaps-secret-2026");

async function getUser(req: NextRequest) {
  const token = req.cookies.get("tm_token")?.value;
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, SECRET); return payload; } catch { return null; }
}

// Generer un token de partage
export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non connecte" }, { status: 401 });
  const { projectId } = await req.json();
  const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  await db.execute(sql`
    UPDATE projects SET share_token = ${token}, share_enabled = TRUE WHERE id = ${projectId}
  `);
  return NextResponse.json({ token });
}

// Desactiver le partage
export async function DELETE(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non connecte" }, { status: 401 });
  const { projectId } = await req.json();
  await db.execute(sql`
    UPDATE projects SET share_enabled = FALSE WHERE id = ${projectId}
  `);
  return NextResponse.json({ success: true });
}
