import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, surveyPoints, alignments, entities } from "@/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        type: projects.type,
        status: projects.status,
        client: projects.client,
        location: projects.location,
        epsgCode: projects.epsgCode,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .orderBy(desc(projects.updatedAt));

    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [row] = await db
      .insert(projects)
      .values({
        name: body.name,
        description: body.description ?? null,
        type: body.type ?? "road_design",
        status: body.status ?? "draft",
        client: body.client ?? null,
        location: body.location ?? null,
        epsgCode: body.epsgCode ?? "4326",
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
