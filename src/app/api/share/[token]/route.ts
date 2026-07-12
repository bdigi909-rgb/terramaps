import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await db.execute(sql`
    SELECT * FROM projects
    WHERE share_token = ${token} AND share_enabled = TRUE
  `);
  if (result.rows.length === 0) return NextResponse.json({ error: "Lien invalide" }, { status: 404 });
  const project = result.rows[0] as any;
  
  const points = await db.execute(sql`
    SELECT name, code, x, y, z FROM survey_points WHERE project_id = ${project.id} LIMIT 50
  `);
  
  const photos = await db.execute(sql`
    SELECT id, filename, description, user_name, created_at FROM terrain_photos WHERE project_id = ${project.id}
  `);
  
  return NextResponse.json({ project, points: points.rows, photos: photos.rows });
}
