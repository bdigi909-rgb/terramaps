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

export async function GET() {
  const result = await db.execute(sql`SELECT * FROM messages ORDER BY created_at DESC LIMIT 50`);
  return NextResponse.json(result.rows.reverse());
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Message vide" }, { status: 400 });
  const result = await db.execute(sql`
    INSERT INTO messages (user_id, user_name, content)
    VALUES (${user.id as number}, ${user.name as string}, ${content.trim()})
    RETURNING *
  `);
  return NextResponse.json(result.rows[0]);
}
