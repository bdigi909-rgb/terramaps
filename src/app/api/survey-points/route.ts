import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const result = await db.execute(sql`
    UPDATE survey_points 
    SET name = ${body.name}, code = ${body.code}, x = ${body.x}, y = ${body.y}, z = ${body.z}
    WHERE id = ${body.id}
    RETURNING *
  `);
  return NextResponse.json(result.rows[0]);
}
