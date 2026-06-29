import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { entities } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const rows = await db
      .select()
      .from(entities)
      .where(eq(entities.projectId, parseInt(id)))
      .orderBy(asc(entities.id));
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch entities" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const [row] = await db
      .insert(entities)
      .values({
        projectId: parseInt(id),
        layerId: body.layerId ?? null,
        entityType: body.entityType,
        geometry: body.geometry,
        properties: body.properties ?? null,
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create entity" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const entityId = searchParams.get("entityId");
  try {
    if (entityId) {
      await db.delete(entities).where(eq(entities.id, parseInt(entityId)));
    } else {
      await db.delete(entities).where(eq(entities.projectId, parseInt(id)));
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete entity" }, { status: 500 });
  }
}
