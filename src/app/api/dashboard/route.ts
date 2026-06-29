import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, surveyPoints, alignments, entities } from "@/db/schema";
import { count, desc, sql } from "drizzle-orm";

export async function GET() {
  try {
    const [projectCount] = await db.select({ count: count() }).from(projects);
    const [pointCount] = await db.select({ count: count() }).from(surveyPoints);
    const [alignCount] = await db.select({ count: count() }).from(alignments);
    const [entityCount] = await db.select({ count: count() }).from(entities);

    // Status breakdown
    const statusRows = await db
      .select({ status: projects.status, count: count() })
      .from(projects)
      .groupBy(projects.status);

    // Type breakdown
    const typeRows = await db
      .select({ type: projects.type, count: count() })
      .from(projects)
      .groupBy(projects.type);

    // Recent projects
    const recentProjects = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.updatedAt))
      .limit(5);

    return NextResponse.json({
      totals: {
        projects: projectCount?.count ?? 0,
        points: pointCount?.count ?? 0,
        alignments: alignCount?.count ?? 0,
        entities: entityCount?.count ?? 0,
      },
      statusBreakdown: statusRows,
      typeBreakdown: typeRows,
      recentProjects,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
