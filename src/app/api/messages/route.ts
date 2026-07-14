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

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non connecte" }, { status: 401 });
  const isAdmin = user.role === "admin" || user.role === "manager";
  const rows = await db.execute(sql`
    SELECT * FROM messages 
    WHERE ${isAdmin ? sql`TRUE` : sql`from_user_id = ${user.id as number} OR to_user_id = ${user.id as number}`}
    ORDER BY created_at DESC
  `);
  return NextResponse.json(rows.rows);
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non connecte" }, { status: 401 });
  const { subject, content, toUserId, projectId } = await req.json();
  const result = await db.execute(sql`
    INSERT INTO messages (from_user_id, from_name, to_user_id, subject, content, project_id)
    VALUES (${user.id as number}, ${user.name as string}, ${toUserId || null}, ${subject || null}, ${content}, ${projectId || null})
    RETURNING *
  `);
  return NextResponse.json(result.rows[0]);
}

export async function PATCH(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non connecte" }, { status: 401 });
  const { id } = await req.json();
  await db.execute(sql`UPDATE messages SET read = TRUE WHERE id = ${id}`);
  return NextResponse.json({ success: true });
}
