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
  const rows = isAdmin
    ? await db.execute(sql`SELECT * FROM messages ORDER BY created_at DESC`)
    : await db.execute(sql`SELECT * FROM messages WHERE user_id = ${user.id as number} OR to_user_id = ${user.id as number} ORDER BY created_at DESC`);
  return NextResponse.json(rows.rows);
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non connecte" }, { status: 401 });
  
  const body = await req.json();
  const { content, toUserId, isReply } = body;
  
  console.log("POST messages:", { content, toUserId, isReply, userId: user.id });
  
  const result = await db.execute(sql`
    INSERT INTO messages (user_id, user_name, content, is_reply, to_user_id)
    VALUES (${user.id as number}, ${user.name as string}, ${content}, ${isReply === true}, ${toUserId || null})
    RETURNING *
  `);
  return NextResponse.json(result.rows[0]);
}
