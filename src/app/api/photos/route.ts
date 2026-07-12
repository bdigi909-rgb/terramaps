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
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) return NextResponse.json([]);
  const result = await db.execute(sql`
    SELECT id, project_id, user_name, filename, description, data, created_at
    FROM terrain_photos WHERE project_id = ${parseInt(projectId)}
    ORDER BY created_at DESC
  `);
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non connecte" }, { status: 401 });
  const { projectId, filename, data, description } = await req.json();
  const result = await db.execute(sql`
    INSERT INTO terrain_photos (project_id, user_id, user_name, filename, data, description)
    VALUES (${projectId}, ${user.id as number}, ${user.name as string}, ${filename}, ${data}, ${description || ""})
    RETURNING id, project_id, user_name, filename, description, created_at
  `);
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non connecte" }, { status: 401 });
  const { id } = await req.json();
  await db.execute(sql`DELETE FROM terrain_photos WHERE id = ${id}`);
  return NextResponse.json({ success: true });
}
