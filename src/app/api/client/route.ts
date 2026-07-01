import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, surveyPoints, alignments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "terramaps-secret-2026");

export async function GET(req: NextRequest) {
  const token = req.cookies.get("tm_token")?.value;
  if (!token) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const allProjects = await db.select().from(projects);
    const clientProjects = payload.role === "client"
      ? allProjects.filter(p => p.client?.toLowerCase().includes((payload.email as string).split("@")[0].toLowerCase()))
      : allProjects;
    const result = await Promise.all(clientProjects.map(async p => {
      const points = await db.select().from(surveyPoints).where(eq(surveyPoints.projectId, p.id));
      const aligns = await db.select().from(alignments).where(eq(alignments.projectId, p.id));
      return { ...p, pointsCount: points.length, alignmentsCount: aligns.length };
    }));
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }
}
