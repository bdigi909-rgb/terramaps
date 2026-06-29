import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { volumeReports, crossSections } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const rows = await db
      .select()
      .from(volumeReports)
      .where(eq(volumeReports.projectId, parseInt(id)))
      .orderBy(asc(volumeReports.id));
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch volume reports" }, { status: 500 });
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
      .insert(volumeReports)
      .values({
        projectId: parseInt(id),
        alignmentId: body.alignmentId ?? null,
        name: body.name,
        totalCut: body.totalCut ?? null,
        totalFill: body.totalFill ?? null,
        netVolume: body.netVolume ?? null,
        reportData: body.reportData ?? null,
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create volume report" }, { status: 500 });
  }
}
