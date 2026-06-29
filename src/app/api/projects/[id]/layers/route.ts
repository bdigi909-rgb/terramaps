import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { layers } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const rows = await db
      .select()
      .from(layers)
      .where(eq(layers.projectId, parseInt(id)))
      .orderBy(asc(layers.id));
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch layers" }, { status: 500 });
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
      .insert(layers)
      .values({
        projectId: parseInt(id),
        name: body.name,
        color: body.color ?? "#3b82f6",
        lineType: body.lineType ?? "solid",
        lineWidth: body.lineWidth ?? 1,
        visible: body.visible ?? true,
        locked: body.locked ?? false,
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create layer" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const layerId = searchParams.get("layerId");
  if (!layerId) return NextResponse.json({ error: "layerId required" }, { status: 400 });
  try {
    const body = await req.json();
    const [row] = await db
      .update(layers)
      .set({
        name: body.name,
        color: body.color,
        lineType: body.lineType,
        lineWidth: body.lineWidth,
        visible: body.visible,
        locked: body.locked,
      })
      .where(eq(layers.id, parseInt(layerId)))
      .returning();
    return NextResponse.json(row);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update layer" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const layerId = searchParams.get("layerId");
  try {
    if (layerId) {
      await db.delete(layers).where(eq(layers.id, parseInt(layerId)));
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete layer" }, { status: 500 });
  }
}
