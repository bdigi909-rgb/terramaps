import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { surveyPoints, alignments, entities, layers, crossSections } from "@/db/schema";
import { eq, count, sum } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pid = parseInt(id);
  try {
    const [pointsCount] = await db
      .select({ count: count() })
      .from(surveyPoints)
      .where(eq(surveyPoints.projectId, pid));

    const [alignmentsCount] = await db
      .select({ count: count() })
      .from(alignments)
      .where(eq(alignments.projectId, pid));

    const [entitiesCount] = await db
      .select({ count: count() })
      .from(entities)
      .where(eq(entities.projectId, pid));

    const [layersCount] = await db
      .select({ count: count() })
      .from(layers)
      .where(eq(layers.projectId, pid));

    return NextResponse.json({
      points: pointsCount?.count ?? 0,
      alignments: alignmentsCount?.count ?? 0,
      entities: entitiesCount?.count ?? 0,
      layers: layersCount?.count ?? 0,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
