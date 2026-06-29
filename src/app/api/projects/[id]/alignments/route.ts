import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { alignments, alignmentElements } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const rows = await db
      .select()
      .from(alignments)
      .where(eq(alignments.projectId, parseInt(id)))
      .orderBy(asc(alignments.id));
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch alignments" }, { status: 500 });
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
      .insert(alignments)
      .values({
        projectId: parseInt(id),
        name: body.name,
        type: body.type ?? "horizontal",
        description: body.description ?? null,
        totalLength: body.totalLength ?? null,
        geometry: body.geometry ?? null,
      })
      .returning();

    // Optionally insert elements
    if (body.elements && Array.isArray(body.elements)) {
      await db.insert(alignmentElements).values(
        body.elements.map((el: Record<string, unknown>, idx: number) => ({
          alignmentId: row.id,
          order: idx,
          elementType: el.elementType,
          startStation: el.startStation ?? null,
          endStation: el.endStation ?? null,
          startX: el.startX ?? null,
          startY: el.startY ?? null,
          endX: el.endX ?? null,
          endY: el.endY ?? null,
          radius: el.radius ?? null,
          parameter: el.parameter ?? null,
          length: el.length ?? null,
          bearing: el.bearing ?? null,
        }))
      );
    }

    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create alignment" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const alignId = searchParams.get("alignId");
  try {
    if (alignId) {
      await db.delete(alignments).where(eq(alignments.id, parseInt(alignId)));
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
