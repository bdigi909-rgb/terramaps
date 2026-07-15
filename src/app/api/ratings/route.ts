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

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non connecte" }, { status: 401 });
  const { projectId, rating, comment } = await req.json();
  await db.execute(sql`
    INSERT INTO ratings (project_id, user_id, rating, comment)
    VALUES (${projectId}, ${user.id as number}, ${rating}, ${comment || null})
    ON CONFLICT DO NOTHING
  `);
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const rows = await db.execute(sql`
    SELECT * FROM ratings WHERE project_id = ${parseInt(projectId || "0")}
  `);
  const avg = rows.rows.length > 0 
    ? rows.rows.reduce((a: number, r: any) => a + r.rating, 0) / rows.rows.length 
    : 0;
  return NextResponse.json({ ratings: rows.rows, average: avg.toFixed(1) });
}
