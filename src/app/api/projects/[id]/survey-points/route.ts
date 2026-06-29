import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { surveyPoints } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const rows = await db
      .select()
      .from(surveyPoints)
      .where(eq(surveyPoints.projectId, parseInt(id)))
      .orderBy(asc(surveyPoints.id));
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch points" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();

    // Support bulk insert (array) or single insert
    if (Array.isArray(body)) {
      const rows = await db
        .insert(surveyPoints)
        .values(
          body.map((p) => ({
            projectId: parseInt(id),
            name: p.name ?? null,
            code: p.code ?? null,
            x: parseFloat(p.x),
            y: parseFloat(p.y),
            z: parseFloat(p.z),
            description: p.description ?? null,
          }))
        )
        .returning();
      return NextResponse.json(rows, { status: 201 });
    }

    const [row] = await db
      .insert(surveyPoints)
      .values({
        projectId: parseInt(id),
        name: body.name ?? null,
        code: body.code ?? null,
        x: parseFloat(body.x),
        y: parseFloat(body.y),
        z: parseFloat(body.z),
        description: body.description ?? null,
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create point" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { searchParams } = new URL(req.url);
    const pointId = searchParams.get("pointId");
    if (pointId) {
      await db
        .delete(surveyPoints)
        .where(eq(surveyPoints.id, parseInt(pointId)));
    } else {
      await db
        .delete(surveyPoints)
        .where(eq(surveyPoints.projectId, parseInt(id)));
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete point(s)" }, { status: 500 });
  }
}
